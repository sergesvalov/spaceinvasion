pipeline {
    agent { label 'built-in' }

    parameters {
        booleanParam(name: 'BUILD_ANDROID', defaultValue: true, description: 'Собрать версию для Android (APK)')
        booleanParam(name: 'BUILD_TELEGRAM', defaultValue: true, description: 'Собрать веб-версию для Telegram (ZIP)')
        booleanParam(name: 'BUILD_PC', defaultValue: true, description: 'Собрать standalone-версию для ПК (ZIP + .bat)')
        booleanParam(name: 'BUILD_MAC', defaultValue: true, description: 'Собрать standalone-версию для Mac (ZIP + .command)')
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
                expression { params.BUILD_TELEGRAM || params.BUILD_ANDROID || params.BUILD_PC || params.BUILD_MAC }
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

        stage('Package PC Version') {
            when {
                expression { params.BUILD_PC }
            }
            steps {
                script {
                    echo "Архивируем ПК-версию..."
                    withBuilder {
                        sh "cp PlayGame.bat dist/"
                        sh "cd dist && zip -r ../spaceinvasion-pc.zip *"
                    }
                }
            }
        }

        stage('Package Mac Version') {
            when {
                expression { params.BUILD_MAC }
            }
            steps {
                script {
                    echo "Архивируем Mac-версию..."
                    withBuilder {
                        sh "cp PlayGame.command dist/"
                        sh "chmod +x dist/PlayGame.command"
                        sh "cd dist && zip -r ../spaceinvasion-mac.zip *"
                    }
                }
            }
        }

        stage('Package Telegram Bot & Build Web Image') {
            when {
                expression { params.BUILD_TELEGRAM }
            }
            steps {
                script {
                    echo "Архивируем веб-сборку для Telegram бота..."
                    withBuilder {
                        sh "cd dist && zip -r ../spaceinvasion-telegram.zip *"
                    }

                    echo "Сборка Docker-образа для Raspberry Pi (Web App)..."
                    sh "docker build -t ${REGISTRY_IP}:${REGISTRY_PORT}/spaceinvasion-web:latest -f Dockerfile.web ."
                    
                    echo "Пушим веб-образ в локальный реестр..."
                    sh "docker push ${REGISTRY_IP}:${REGISTRY_PORT}/spaceinvasion-web:latest"
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
                        
                        // Генерация иконок для Android
                        sh "npx @capacitor/assets generate --android"
                        
                        // Сборка релизного APK
                        sh "cd android && gradle assembleRelease"

                        // Выравнивание и подпись APK
                        echo "Выравниваем и подписываем APK..."
                        sh '''
                            APK_DIR="android/app/build/outputs/apk/release"
                            /opt/android-sdk/build-tools/37.0.0/zipalign -v -p 4 ${APK_DIR}/app-release-unsigned.apk ${APK_DIR}/app-release-aligned.apk
                            /opt/android-sdk/build-tools/37.0.0/apksigner sign --ks release.keystore --ks-pass pass:spaceinvasion --key-pass pass:spaceinvasion --out ${APK_DIR}/spaceinvasion-release.apk ${APK_DIR}/app-release-aligned.apk
                            rm ${APK_DIR}/app-release-unsigned.apk ${APK_DIR}/app-release-aligned.apk
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'spaceinvasion-pc.zip', fingerprint: true, allowEmptyArchive: true
            archiveArtifacts artifacts: 'spaceinvasion-mac.zip', fingerprint: true, allowEmptyArchive: true
            archiveArtifacts artifacts: 'spaceinvasion-telegram.zip', fingerprint: true, allowEmptyArchive: true
            archiveArtifacts artifacts: 'android/app/build/outputs/apk/release/*.apk', fingerprint: true, allowEmptyArchive: true
            echo "Successfully built Space Invasion Web & Android APK & PC & Mac Versions! 🎉"
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
