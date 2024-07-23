import React, { useState } from 'react';

function ManageCourses({ courseRequirements, setCourseRequirements }) {
    //const [courseRequirements, setCourseRequirements] = useState([{ course: "", grade: 0 }]);

    const handleCourseChange = (index, field, value) => {
        const newCourses = [...courseRequirements];
        newCourses[index][field] = value;
        setCourseRequirements(newCourses);
    };

    const addNewCourse = () => {
        setCourseRequirements([...courseRequirements, { name: "", grade: 0 }]);
    };

    return (
        <>
            <table>
                <thead>
                    <tr>
                        <th>Course Name</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {courseRequirements.map((course, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    name="name"
                                    placeholder="Course Name"
                                    value={course.name}
                                    onChange={(e) => handleCourseChange(index, 'name', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    name="grade"
                                    type="number"
                                    placeholder="Course Grade"
                                    value={course.grade}
                                    onChange={(e) => handleCourseChange(index, 'grade', e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                onClick={addNewCourse}
                style={{
                    display: 'block',
                    margin: '20px auto',
                    padding: '10px 20px',
                    color: '#fff',
                    backgroundColor: '#007bff',
                    border: '1px solid #007bff',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Add New Course
            </button>
        </>
    );
}

export default ManageCourses;