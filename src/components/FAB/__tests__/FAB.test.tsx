import React from "react";
import renderer, { act } from "react-test-renderer";
import FAB from "../FAB";

describe("Test to evaluate <FAB /> component", () => {
    it("should render correctly", () => {
        const tree: any = renderer.create(<FAB onOpen={() => {}} />).toJSON();
        expect(tree.children.length).toBe(2);
    });
});
