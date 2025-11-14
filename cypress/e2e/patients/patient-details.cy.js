describe("Patient 1 — Full Details API", () => {
  let data;

  before(() => {
    cy.login();

    cy.getPatientDetails(1).then((res) => {
      data = res;
    });
  });

  it("loads basic patient information", () => {
    expect(data.patient).to.exist;
    expect(data.patient.nombre).to.eq("Juan Pérez Martínez");
    expect(data.patient.sexo).to.be.a("string");
    expect(data.patient.telefono).to.have.length(10);
  });

  it("loads consultations with nested diagnostics & treatments", () => {
    expect(data.consultations).to.be.an("array");
    expect(data.consultations.length).to.be.gt(0);

    const consult = data.consultations[1];
    expect(consult).to.have.property("motivo");

    const diag = consult.diagnostics?.[0];
    expect(diag).to.exist;
    expect(diag.nombre).to.be.a("string");

    const treatment = diag.treatments?.[0];
    expect(treatment).to.exist;
    expect(treatment.Nombre).to.be.a("string");
  });

  it("loads exams with valid S3 metadata", () => {
    expect(data.exams).to.be.an("array");

    const exam = data.exams[0];
    expect(exam.s3_key).to.be.a("string");
    expect(exam.file_size).to.be.gt(0);
    expect(exam.mime_type).to.match(/pdf/);
  });

  it("loads complete medical record", () => {
    expect(data.medical_record).to.exist;

    expect(data.medical_record.oculares).to.be.a("string");
    expect(data.medical_record.familiares).to.be.a("string");
    expect(data.medical_record.medicos).to.be.a("string");
  });
});
