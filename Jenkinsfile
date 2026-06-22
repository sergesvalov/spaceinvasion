pipeline {
    agent any

    parameters {
        booleanParam(name: 'BUILD_ANDROID', defaultValue: true, description: 'Собрать версию для Android (APK)')
        booleanParam(name: 'BUILD_TELEGRAM', defaultValue: true, description: 'Собрать веб-версию для Telegram (ZIP)')
    }

    environment {
        // Конфигурация локального реестра
        REGISTRY_IP   = "192.168.10.222" 
        REGISTRY_PORT = "5050"
        
        // Имя образа
        BUILDER_IMAGE = "${REGISTRY_IP}:${REGISTRY_PORT}/spaceinvasion-builder"
    }

    stages {
        stage('Source Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Builder Image') {
            steps {
                script {
                    echo "Сборка Docker-образа Android/Web Builder..."
                    sh "docker build -t ${BUILDER_IMAGE}:latest -f Dockerfile.android ."
                    
                    echo "Пушим сборочный образ в локальный реестр..."
                    sh "docker push ${BUILDER_IMAGE}:latest"
                }
            }
        }

        stage('Build Web App') {
            when {
                expression { params.BUILD_TELEGRAM || params.BUILD_ANDROID }
            }
            steps {
                script {
                    echo "Сборка Vite/Phaser веб-приложения..."
                    withBuilder {
                        sh "npm install"
                        sh "npm run build"
                    }
                }
            }
        }

        stage('Package Telegram Bot') {
            when {
                expression { params.BUILD_TELEGRAM }
            }
            steps {
                script {
                    echo "Архивируем веб-сборку для Telegram бота..."
                    withBuilder {
                        sh "cd dist && zip -r ../spaceinvasion-telegram.zip *"
                    }
                }
            }
        }

        stage('Compile Android APK') {
            when {
                expression { params.BUILD_ANDROID }
            }
            steps {
                script {
                    echo "Генерация Android-проекта через Capacitor и компиляция APK..."
                    withBuilder {
                        // Если папка android отсутствует, cap add сгенерирует её. Иначе cap sync обновит ассеты.
                        sh "npx cap add android || npx cap sync android"
                        
                        // Сборка релизного APK
                        sh "cd android && gradle assembleRelease"
                    }
                }
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'spaceinvasion-telegram.zip', fingerprint: true, allowEmptyArchive: true
            archiveArtifacts artifacts: 'android/app/build/outputs/apk/release/*.apk', fingerprint: true, allowEmptyArchive: true
            echo "Successfully built Space Invasion Web & Android APK! 🎉"
        }
        failure {
            echo "Failed to build the game. Check logs for errors."
        }
    }
}

def withBuilder(Closure body) {
    docker.image("${env.BUILDER_IMAGE}:latest").inside('-u root') {
        body()
    }
}
