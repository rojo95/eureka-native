import { createContext, useMemo, useState } from "react";
import { Drawer } from "react-native-drawer-layout";

type RightDrawerContextType = {
    isOpen: boolean;
    onToggleOpenRight: () => void;
    setRightDrawerContent: (content: JSX.Element) => void;
};

export const RightDrawerContext = createContext<
    RightDrawerContextType | undefined
>(undefined);
export default function RightDrawerScreen({ children }: { children: any }) {
    const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
    const [rightDrawerContent, setRightDrawerContent] =
        useState<JSX.Element | null>(null);

    /**
     * values to be shared to the elements within the context
     */
    const value = useMemo(
        (): RightDrawerContextType => ({
            isOpen: rightDrawerOpen,
            onToggleOpenRight: () => setRightDrawerOpen(!rightDrawerOpen),
            setRightDrawerContent: (content: JSX.Element) =>
                setRightDrawerContent(content),
        }),
        [rightDrawerOpen]
    );

    return (
        <Drawer
            open={rightDrawerOpen}
            onOpen={() => setRightDrawerOpen(true)}
            onClose={() => setRightDrawerOpen(false)}
            drawerPosition="right"
            renderDrawerContent={() => <>{rightDrawerContent}</>}
        >
            <RightDrawerContext.Provider value={value}>
                {children}
            </RightDrawerContext.Provider>
        </Drawer>
    );
}
