import React from 'react';

const Privacy = () => {
    return (
        <div className="container" style={{ padding: '50px 20px', color: 'white' }}>
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>
                This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
            </p>
            <h2>Collecting and Using Your Personal Data</h2>
            <p>
                We use Your Personal Data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
            {/* Add more content as needed */}
        </div>
    );
};

export default Privacy;
