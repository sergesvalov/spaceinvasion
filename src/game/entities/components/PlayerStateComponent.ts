import Phaser from 'phaser';
import { EntityManager } from '../../managers/EntityManager';
import { burst } from '../../effects/burst';
import { EventBus } from '../../../services/EventBus';
import { AudioManager } from '../../../services/AudioManager';
import { GameConfig } from '../../config/GameConfig';

export interface PlayerContext {
  x: number;
  y: number;
  sprite: Phaser.GameObjects.Sprite;
  body: Phaser.Physics.Arcade.Body;
  exhaustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  shieldGraphics: Phaser.GameObjects.Graphics;
  scene: Phaser.Scene;
}

export interface PlayerStateComponent {
  enter(context: PlayerContext): void;
  exit(context: PlayerContext): void;
  update(context: PlayerContext, entityManager: EntityManager, time: number): void;
}

export class FighterState implements PlayerStateComponent {
  enter(context: PlayerContext): void {
    context.sprite.setTexture('ship');
    context.sprite.setTint(0xffffff); // Normal color
    context.sprite.setScale(0.5488);
    
    if (context.exhaustEmitter) {
      context.exhaustEmitter.setConfig({
        speedY: { min: 200, max: 400 },
        speedX: { min: -20, max: 20 },
        scale: { start: 1.5, end: 0 },
        tint: [0x00aaff, 0x0044ff]
      });
      context.exhaustEmitter.startFollow(context.sprite.parentContainer, 0, 40);
    }
    
    if (context.body) {
      context.body.setSize(40, 46);
      context.body.setOffset(-20, -26);
    }

    context.shieldGraphics.setVisible(false);
    context.scene.tweens.killTweensOf(context.shieldGraphics);
    context.shieldGraphics.alpha = 1;
  }

  exit(_context: PlayerContext): void {
    // No specific exit logic needed for Fighter
  }

  update(_context: PlayerContext, _entityManager: EntityManager, _time: number): void {
    // Fighter has no specific update logic (like melee)
  }
}

export class MechaState implements PlayerStateComponent {
  private lastMeleeFired: number = 0;

  enter(context: PlayerContext): void {
    context.sprite.setTexture('mecha');
    context.sprite.setTint(0xffffff);
    context.sprite.setScale(0.528); // 10% larger than the old 0.12 baseline
    
    if (context.exhaustEmitter) {
      context.exhaustEmitter.setConfig({
        speedY: { min: 100, max: 200 },
        speedX: { min: -30, max: 30 },
        scale: { start: 2.5, end: 0 },
        tint: [0xffaa00, 0xff4400]
      });
      context.exhaustEmitter.startFollow(context.sprite.parentContainer, 0, 53);
    }
    
    if (context.body) {
      context.body.setSize(53, 53);
      context.body.setOffset(-26, -26);
    }

    context.shieldGraphics.setVisible(true);
    
    // Pulse animation for shield
    context.scene.tweens.add({
      targets: context.shieldGraphics,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Shockwave visual & event
    burst(context.scene, context.x, context.y, 1, {
      speed: 600,
      scale: { start: 0, end: 15 },
      alpha: { start: 0.8, end: 0 },
      blendMode: 'ADD',
      lifespan: 400,
      tint: 0xffaa00
    });

    EventBus.emit('mecha_shockwave', { x: context.x, y: context.y, radius: 400 });
  }

  exit(_context: PlayerContext): void {
    // Reverted when entering Fighter state
  }

  update(context: PlayerContext, entityManager: EntityManager, time: number): void {
    if (time < this.lastMeleeFired + 1000) return; // 1s cooldown

    let nearestDist = Infinity;
    entityManager.enemies.children.iterate((c) => {
      const e = c as any;
      if (e.active) {
        const dist = Phaser.Math.Distance.Between(context.x, context.y, e.x, e.y);
        if (dist < nearestDist) {
          nearestDist = dist;
        }
      }
      return true;
    });

    if (nearestDist < 150) {
      this.lastMeleeFired = time;
      this.performMeleeSlash(context, entityManager);
    }
  }

  private performMeleeSlash(context: PlayerContext, entityManager: EntityManager) {
    AudioManager.getInstance().playExplosion(context.scene, { volume: 0.5, rate: 2.0 });

    const slash = context.scene.add.graphics();
    slash.lineStyle(8, 0x00ffff, 1);
    slash.beginPath();
    slash.arc(context.x, context.y - 20, 100, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
    slash.strokePath();

    context.scene.tweens.add({
      targets: slash,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 300,
      onComplete: () => slash.destroy()
    });

    entityManager.enemies.children.iterate((c) => {
      const e = c as any;
      if (e.active) {
        const dist = Phaser.Math.Distance.Between(context.x, context.y - 20, e.x, e.y);
        if (dist < 150 && e.y < context.y) {
          e.takeDamage(GameConfig.Player.DamageMecha * 5); 
        }
      }
      return true;
    });
  }
}
