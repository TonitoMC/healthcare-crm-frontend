Cypress.Commands.add("login", () => {
  cy.request("POST", "http://localhost:8080/api/auth/login", {
    identifier: "admin",
    password: "supersecret",
  }).then((response) => {
    const token = response.body.token;

    // Store in localStorage (for UI)
    window.localStorage.setItem("authToken", token);

    // Store for cy.request() calls
    cy.wrap(token).as("token");
  });
});

Cypress.Commands.add("getPatientDetails", (id = 1) => {
  return cy.get("@token").then((token) => {
    return cy
      .request({
        method: "GET",
        url: `http://localhost:8080/api/patients/${id}/details?include=exams,consultations,record`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        expect(res.status).to.eq(200);
        return res.body; // return patient data for chaining
      });
  });
});
