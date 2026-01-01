// JitPack publishing configuration
afterEvaluate {
    publishing {
        publications {
            create<MavenPublication>("release") {
                from(components["release"])
                
                groupId = "com.github.${project.findProperty("github.user") ?: "yourusername"}"
                artifactId = "nivostack-android"
                version = project.findProperty("version") as? String ?: "1.0.0"
                
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

