describe("Exams API", () => {
  const base = "http://localhost:8080/api/exams";

  // ---------------------------------------------
  // 1️⃣ Unauthorized users MUST fail
  // ---------------------------------------------
  it("fails without JWT", () => {
    cy.request({
      method: "GET",
      url: `${base}/pending`,
      failOnStatusCode: false, // we EXPECT failure
    }).then((res) => {
      expect(res.status).to.eq(400); // backend should block this
    });
  });

  // ---------------------------------------------
  // 2️⃣ With JWT, exams should load
  // ---------------------------------------------
  it("loads pending exams with valid JWT", () => {
    cy.login(); // sets @token

    cy.get("@token").then((token) => {
      cy.request({
        method: "GET",
        url: `${base}/pending`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");

        // Should not be empty (assuming seed data)
        expect(res.body.length).to.be.gt(0);

        // sample structure verification
        const exam = res.body[0];
        expect(exam).to.have.property("id");
        expect(exam).to.have.property("tipo");
        expect(exam).to.have.property("paciente_id");

        // Check exam is actually pending
        expect(exam.estado).to.satisfy(
          (state) => state === "" || state === "pending" || state == null,
        );
      });
    });
  });

  // ---------------------------------------------
  // 3️⃣ Exams for a given patient should also load
  // ---------------------------------------------
  it("loads exams for patient 1 with JWT", () => {
    cy.login();

    cy.get("@token").then((token) => {
      cy.request({
        method: "GET",
        url: `${base}/patient/1`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.gt(0);

        const exam = res.body[0];
        expect(exam.id).to.be.a("number");
        expect(exam.tipo).to.be.a("string");
        expect(exam.paciente_id).to.eq(1);
      });
    });
  });
});
