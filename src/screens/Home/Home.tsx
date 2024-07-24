import { View } from "react-native";
import AppHeader from "components/AppHeader/AppHeader";
import { useTranslation } from "react-i18next";

export default function HomeScreen({ navigation }: { navigation: any }) {
    const { t } = useTranslation();

    return (
        <View>
            <AppHeader title={t("menu-title-home")} />
        </View>
    );
}
