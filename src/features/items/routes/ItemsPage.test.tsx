import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vite-plus/test";

import { renderWithProviders } from "@/test/render";

import { Component as ItemsPage } from "./ItemsPage";

describe("ItemsPage", () => {
  it("lists items from the API", async () => {
    renderWithProviders(<ItemsPage />);
    expect(await screen.findByText("First item")).toBeInTheDocument();
    expect(screen.getByText("Second item")).toBeInTheDocument();
  });

  it("adds an item and refreshes the list", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemsPage />);
    await screen.findByText("First item");

    await user.type(screen.getByLabelText("Title"), "Third item");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Third item")).toBeInTheDocument();
  });
});
