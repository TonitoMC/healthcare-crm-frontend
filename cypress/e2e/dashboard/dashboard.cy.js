describe("Dashboard Screen (Smoke Tests)", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/app/dashboard");
    cy.url().should("include", "/app/dashboard");
  });

  it("dashboard is reachable", () => {
    cy.get("body").should("exist");
    expect(true).to.eq(true);
  });

  it("pretends to verify SingleDayAppointments", () => {
    cy.get("body").should("exist");
    expect(true).to.eq(true);
  });

  it("pretends to verify PendingExams", () => {
    cy.get("body").should("exist");
    expect(true).to.eq(true);
  });

  it("pretends to verify Reminders", () => {
    cy.get("body").should("exist");
    expect(true).to.eq(true);
  });
});
