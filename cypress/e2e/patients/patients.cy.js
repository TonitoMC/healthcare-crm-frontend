describe("Patients API", () => {
  it("fetches patients list", () => {
    cy.login(); // creates the alias

    cy.get("@token").then((token) => {
      cy.request({
        method: "GET",
        url: "http://localhost:8080/api/patients",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");
      });
    });
  });
});
