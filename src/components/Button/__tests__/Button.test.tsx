import React from "react";
import renderer from "react-test-renderer";

import Button, { BUTTON_TYPES } from "../Button";
import { Button as ButtonRNP } from "react-native-paper";
import Text from "components/Text/Text";

describe("Test to evaluate <Button /> component", () => {
    it("has 1 child", () => {
        const tree: any = renderer.create(<Button text="text" />).toJSON();
        expect(tree.children.length).toBe(1);
    });

    it("render correctly each kind of button", () => {
        const link: any = renderer
            .create(<Button text="text" type={BUTTON_TYPES.LINK} />)
            .toJSON();
        expect(link.children.length).toBe(1);

        const primary: any = renderer
            .create(<Button text="text" type={BUTTON_TYPES.PRIMARY} />)
            .toJSON();
        expect(primary.children.length).toBe(1);

        const secondary: any = renderer
            .create(<Button text="text" type={BUTTON_TYPES.SECONDARY} />)
            .toJSON();
        expect(secondary.children.length).toBe(1);
    });

    it("renders correctly with text", () => {
        const testText = "test";
        const tree: any = renderer.create(<Button text={testText} />).toJSON();
        const textElement =
            tree.children[0]?.children[0]?.children[0]?.children[1]
                ?.children[0];
        expect(textElement.children).toContain(testText);
    });

    it("renders correctly with icon", () => {
        const textInsideButtonIcon = "Press Me";
        const tree: any = renderer
            .create(
                <Button
                    icon={
                        <ButtonRNP icon="camera">
                            {textInsideButtonIcon}
                        </ButtonRNP>
                    }
                />
            )
            .toJSON();

        const icon =
            tree?.children[0]?.children[0]?.children[0]?.children[0]
                ?.children[0]?.children[0]?.children[0]?.children[0]?.children;

        expect(icon[0].props.testID).toBe("button-icon-container");
        expect(icon[1]?.children[0]).toBe(textInsideButtonIcon);
    });

    it("should render children correctly", () => {
        const childrenInsideButton = "Text Button test";
        const tree: any = renderer
            .create(
                <Button>
                    <Text>{childrenInsideButton}</Text>
                </Button>
            )
            .toJSON();
        const text =
            tree?.children[0]?.children[0]?.children[0]?.children[1]
                ?.children[0];
        expect(text.children).toContain(childrenInsideButton);
    });

    it("render button without change", () => {
        const tree = renderer.create(<Button text="text" />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
