// import { render, screen } from '@testing-library/react';
// import App from './App';
// // import chai
// import chai from 'chai';
// import chaiHttp from 'chai-http';

// // const should = chai.should(); <- convert to reactjs
// const should = chai.should();

// chai.use(chaiHttp);

// describe('Majors API', () => {
//   // Test GET /api/majors
//   it('should GET all majors', (done) => {
//     chai.request(server)
//       .get('/api/majors')
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('array');
//         done();
//       });
//   });

//   // Test POST /api/majors
//   it('should POST a major with course requirements', (done) => {
//     const major = {
//       name: 'Computer Science',
//       course_requirements: [
//         { name: 'Intro to CS', grade: 'A' },
//         { name: 'Data Structures', grade: 'B+' },
//       ],
//     };
//     chai.request(server)
//       .post('/api/majors')
//       .send(major)
//       .end((err, res) => {
//         res.should.have.status(201);
//         res.body.should.have.property('name').eql('Computer Science');
//         res.body.should.have.property('course_requirements');
//         res.body.course_requirements.should.be.a('array');
//         done();
//       });
//   });
// });