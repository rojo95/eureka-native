const ENVIRONMENTS = {
    DEVELOPMENT: "development",
    PREVIEW: "preview",
    PRODUCTION: "production",
};

const ENV = process.env.APP_VARIANT;

const UNIQUE_IDENTIFIER = "com.taktics.eurekanative";

const getAppName = () => {
    switch (ENV) {
    case ENVIRONMENTS.DEVELOPMENT:
        return "Eureka Lite (Dev)";
    case ENVIRONMENTS.PREVIEW:
        return "Eureka Lite (Preview)";
    default:
        return "Eureka Lite";
    }
};

export default {
    expo: {
        name: getAppName(),
        slug: "eureka-native",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff",
        },
        cli: {
            version: ">= 8.0.0",
            appVersionSource: "remote",
        },
        ios: {
            buildNumber: "1",
            supportsTablet: true,
            config: {
                usesNonExemptEncryption: false,
            },
            bundleIdentifier: UNIQUE_IDENTIFIER,
        },
        android: {
            versionCode: "1",
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff",
            },
            permissions: [
                "android.permission.ACCESS_COARSE_LOCATION",
                "android.permission.ACCESS_FINE_LOCATION",
            ],
            package: UNIQUE_IDENTIFIER,
            config: {
                googleMaps: {
                    apiKey: process.env.SECRET_GOOGLE_MAPS_API_KEY,
                },
            },
        },
        web: {
            favicon: "./assets/favicon.png",
        },
        plugins: [
            [
                "expo-location",
                {
                    locationAlwaysAndWhenInUsePermission:
                        "Allow $(PRODUCT_NAME) to use your location.",
                },
            ],
            [
                "expo-secure-store",
                {
                    faceIDPermission:
                        "Allow $(PRODUCT_NAME) to access your Face ID biometric data.",
                },
            ],
            [
                "expo-document-picker",
                {
                    iCloudContainerEnvironment: "Production",
                },
            ],
        ],
        extra: {
            eas: {
                projectId: "34161e48-6d0b-49ff-a416-1cf66d887d30",
            },
        },
        owner: "taktics",
    },
    build: {
        development: {
            developmentClient: true,
            distribution: "internal",
        },

        "ios-simulator": {
            extends: "development",
            ios: {
                simulator: true,
            },
        },

        preview: {
            distribution: "internal",
        },

        production: {
            autoIncrement: true,
        },
    },
    submit: {
        production: {},
    },
};
