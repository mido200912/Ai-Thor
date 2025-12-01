import React from 'react';

const Terms = () => {
    return (
        <div className="container" style={{ padding: '50px 20px', color: 'white' }}>
            <h1>Terms of Service</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>
                Please read these terms and conditions carefully before using Our Service.
            </p>
            <h2>Interpretation and Definitions</h2>
            <p>
                The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
            </p>
            {/* Add more content as needed */}
        </div>
    );
};

export default Terms;
