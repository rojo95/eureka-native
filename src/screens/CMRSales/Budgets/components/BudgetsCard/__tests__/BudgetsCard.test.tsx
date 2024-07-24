import React from "react";
import renderer from "react-test-renderer";
import BudgetsCard from "../BudgetsCard";

describe("Test to evaluate the <BudgetsCard/> component", () => {
    it("should render correctly", () => {
        const tree: any = renderer
            .create(
                <BudgetsCard
                    title={""}
                    state={{ id: 0, name: "" }}
                    totalSale={0}
                    totalCost={0}
                />
            )
            .toJSON();
        expect(tree.children.length).toBe(1);
    });

    it("should render correctly the totalCost value", () => {
        const totalCost = 500;

        const tree: any = renderer
            .create(
                <BudgetsCard
                    title={""}
                    state={{ id: 0, name: "" }}
                    totalSale={0}
                    totalCost={totalCost}
                />
            )
            .toJSON();

        const componentBase =
            tree?.children[0]?.children[0]?.children[0]?.children[3]
                ?.children[0].children;
        expect(componentBase).toEqual([`${totalCost}`, "€"]);
    });

    it("should render correctly the sell value", () => {
        const totalSale = 600;

        const tree: any = renderer
            .create(
                <BudgetsCard
                    title={""}
                    state={{ id: 0, name: "" }}
                    totalCost={10}
                    totalSale={totalSale}
                />
            )
            .toJSON();

        const componentBase =
            tree?.children[0]?.children[0]?.children[0]?.children[3]
                ?.children[3].children;
        expect(componentBase).toEqual([`${totalSale}`, "€"]);
    });

    it("should render correctly the state text", () => {
        const testStatusText = "progress";

        const tree: any = renderer
            .create(
                <BudgetsCard
                    title={""}
                    totalSale={0}
                    totalCost={0}
                    state={{ id: 1, name: testStatusText }}
                />
            )
            .toJSON();

        const componentBase =
            tree?.children[0]?.children[0]?.children[0]?.children[2]
                ?.children[0]?.children[0];
        expect(componentBase).toContain(testStatusText);
    });

    it("should render correctly the index code", () => {
        const idTest = "1234";

        const tree: any = renderer
            .create(
                <BudgetsCard
                    number={idTest}
                    title={""}
                    totalSale={0}
                    totalCost={0}
                    state={{ id: 0, name: "" }}
                />
            )
            .toJSON();

        const componentBase =
            tree?.children[0]?.children[0]?.children[0]?.children[0]
                ?.children[0]?.children[0];
        expect(componentBase).toContain(idTest);
    });

    it("should render correctly the title", () => {
        const testDesc = "test title";

        const tree: any = renderer
            .create(
                <BudgetsCard
                    title={testDesc}
                    totalSale={0}
                    totalCost={0}
                    state={{ id: 1, name: "" }}
                />
            )
            .toJSON();

        const componentBase =
            tree?.children[0]?.children[0]?.children[0]?.children[1]?.children;
        expect(componentBase).toContain(testDesc);
    });

    it("render card without change", () => {
        const tree = renderer
            .create(
                <BudgetsCard
                    title={""}
                    totalSale={0}
                    totalCost={0}
                    state={{ id: 1, name: "" }}
                />
            )
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
