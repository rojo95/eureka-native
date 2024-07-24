import { Platform, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { StyleProps } from "react-native-reanimated";
import { Region } from "react-native-maps";

function Map({
    markerPreset,
    address,
    readOnly = false,
    mapStyle,
}: {
    markerPreset?: { latitude: number; longitude: number } | null;
    address?: Region | null;
    readOnly?: boolean;
    mapStyle?: StyleProps;
}) {
    const [Component, setComponent] = useState<any>(null);

    /**
     * The `useEffect` hook in the provided code snippet is responsible for dynamically loading the
     * appropriate map component based on the platform (web or phone) when the `markerPreset` or
     * `address` props change. Here's a breakdown of what it does:
     */
    useEffect(() => {
        async function loadComponent() {
            if (Platform.OS === "web") {
                // Load web component
                const WebMapComponent = {
                    default: () => <Text>Website Map</Text>,
                };
                setComponent(() => WebMapComponent.default);
            } else {
                // Load phone component
                const PhoneMapComponent = await import("./PhoneMap");
                setComponent(() => PhoneMapComponent.default);
            }
        }

        loadComponent();
    }, [markerPreset, address]);

    /**
     *  A conditional check that ensures an `ActivityIndicator` component is displayed if the `Component`
     * state is falsy or not yet loaded.
     */
    if (!Component) {
        return <ActivityIndicator size="large" />;
    }

    return (
        <Component
            markerPreset={markerPreset}
            readOnly={readOnly}
            address={address}
            mapStyle={mapStyle}
        />
    );
}

export default Map;
