plugins {
    id("com.android.library") version "8.2.0"
    id("org.jetbrains.kotlin.android") version "1.9.20"
    id("maven-publish")
}

// Publishing configuration
afterEvaluate {
    publishing {
        publications {
            create<MavenPublication>("release") {
                from(components["release"])

                groupId = "com.github.${project.findProperty("github.user") ?: "iplixera"}"
                artifactId = "nivostack-android"
                version = project.findProperty("version") as? String ?: "1.1.1"
                
                pom {
                    name.set("NivoStack Android SDK")
                    description.set("Android SDK for NivoStack - Mobile app monitoring and configuration platform")
                    url.set("https://github.com/${project.findProperty("github.user") ?: "iplixera"}/nivostack-monorepo")
                    
                    licenses {
                        license {
                            name.set("MIT")
                            url.set("https://opensource.org/licenses/MIT")
                        }
                    }
                    
                    developers {
                        developer {
                            id.set("nivostack")
                            name.set("NivoStack Team")
                            email.set("support@nivostack.com")
                        }
                    }
                    
                    scm {
                        connection.set("scm:git:git://github.com/${project.findProperty("github.user") ?: "iplixera"}/nivostack-monorepo.git")
                        developerConnection.set("scm:git:ssh://github.com:${project.findProperty("github.user") ?: "iplixera"}/nivostack-monorepo.git")
                        url.set("https://github.com/${project.findProperty("github.user") ?: "iplixera"}/nivostack-monorepo/tree/main")
                    }
                }
            }
        }
    }
}

android {
    namespace = "com.plixera.nivostack"
    compileSdk = 34

    defaultConfig {
        minSdk = 21
        targetSdk = 34

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // Core Android
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")

    // Networking
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")

    // JSON
    implementation("com.google.code.gson:gson:2.10.1")

    // UUID generation
    implementation("com.google.guava:guava:32.1.3-jre")

    // Device info
    implementation("androidx.lifecycle:lifecycle-process:2.7.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
}
