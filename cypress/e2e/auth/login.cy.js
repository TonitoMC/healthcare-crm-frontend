// cypress/e2e/login.cy.js

describe("Real Login Test", () => {
  it("logs in using the real backend", () => {
    cy.visit("/");

    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("supersecret");

    cy.contains("Ingresar").click();

    // Expect dashboard
    cy.url().should("include", "/app/dashboard");
    cy.contains("Bienvenido").should("exist");
  });
});

describe("Programmatic Login Test", () => {
  it("logs in using cy.login() without UI", () => {
    cy.login(); // <-- custom command (real backend request)

    // Visit dashboard directly
    cy.visit("/app/dashboard");

    // Ensures dashboard loads when JWT is present
    cy.contains("Bienvenido").should("exist");
  });
});
