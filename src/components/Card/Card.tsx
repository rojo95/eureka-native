import {
    Pressable,
    PressableProps,
    StyleSheet,
    View,
    ViewProps,
} from "react-native";
import React, { ReactNode } from "react";
import { DefaultTheme, useTheme } from "react-native-paper";

export default function Card({ children }: { children: ReactNode }) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>{children}</View>
        </View>
    );
}

Card.Header = (props: ViewProps) => {
    const theme: DefaultTheme = useTheme();
    return (
        <View
            {...props}
            style={[
                styles.padding,
                styles.header,
                {
                    borderColor: theme.colors.lightGrey,
                },
                props.style,
            ]}
        >
            {props.children}
        </View>
    );
};

Card.Body = (props: ViewProps) => (
    <View {...props} style={[styles.body, props.style]}>
        {props.children}
    </View>
);

Card.Footer = (props: ViewProps) => (
    <View {...props} style={[styles.footer, props.style]}>
        {props.children}
    </View>
);
Card.Action = (props: PressableProps) => <Pressable {...props}></Pressable>;

const styles = StyleSheet.create({
    padding: {
        padding: 10,
    },
    header: {
        minHeight: 40,
        borderBottomWidth: 1,
    },
    footer: {
        margin: 10,
    },
    body: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    container: {
        padding: 10,
        width: "100%",
    },
    content: {
        borderRadius: 5,
        overflow: "hidden",
        elevation: 6,
        shadowColor: "#000",
        backgroundColor: "white",
        margin: 2,
    },
});
