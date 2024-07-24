import React from "react";
import renderer from "react-test-renderer";

import Text from "../Text";

describe("Testing about <Text/> component ", () => {
    const testText = "Testeo";
    it("render correctly", () => {
        const tree: any = renderer.create(<Text>{testText}</Text>).toJSON();
        expect(tree.children.length).toBe(1);
    });

    it("show correct text", () => {
        const tree: any = renderer.create(<Text>{testText}</Text>).toJSON();
        expect(tree.children[0]).toBe(testText);
    });

    it("render text without change", () => {
        const tree = renderer.create(<Text>{testText}</Text>).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
