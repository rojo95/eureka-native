import Toast from "react-native-root-toast";

export const NOTIFICATION_TYPES = {
    SUCCESS: 1,
    DANGER: 2,
    DEFAULT: 3,
} as const;

type NotificationKind =
    (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const DURATION = {
    LONG: "LONG",
    SHORT: "SHORT",
} as const;

type Duration = (typeof DURATION)[keyof typeof DURATION];

export const POSITION = {
    CENTER: "CENTER",
    BOTTOM: "BOTTOM",
    TOP: "TOP",
} as const;

type Position = (typeof POSITION)[keyof typeof POSITION];

export function notificationToast({
    type = NOTIFICATION_TYPES.DEFAULT,
    text,
    opacity = 1,
    duration = DURATION.LONG,
    position = POSITION.BOTTOM,
}: {
    text: string;
    type?: NotificationKind;
    opacity?: number;
    duration?: Duration;
    position?: Position;
}) {
    return Toast.show(text, {
        opacity: opacity,
        ...(type !== NOTIFICATION_TYPES.DEFAULT && {
            backgroundColor:
                type === NOTIFICATION_TYPES.SUCCESS ? "#44cf73" : "#ee5a3f",
        }),
        duration: Toast.durations[duration],
        position: Toast.positions[position],
    });
}
