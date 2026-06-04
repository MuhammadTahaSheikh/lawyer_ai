// InfoTab.js
import React, { useState } from "react";


const ContactInfoTab = ({ contact, privateNotes }) => {
  const [hideEmptyFields, setHideEmptyFields] = useState(false);

  const toggleHideFields = () => {
    setHideEmptyFields(!hideEmptyFields);
  };

  const renderField = (label, value) => {
    if (hideEmptyFields && (!value || value === "N/A")) return null;
    return (
      <p>
        <strong>{label}:</strong> {value || "N/A"}
      </p>
    );
  };

  return (
    <div className="info-tab">
      {/* Toggle Button */}
      {/* <button className="toggle-button" onClick={toggleHideFields}>
        {hideEmptyFields ? "Show All Fields" : "Hide Custom Fields Without a Value"}
      </button> */}

      {/* Row 1: Contact Information */}
      <div className="info-row">
        <h3>Contact Information</h3>
        {renderField("Name", `${contact.first_name} ${contact.last_name}`)}
        {renderField("Group", contact.contact_group)}
        {renderField("Email Address", contact.email)}
        {renderField("Phone Numbers", `${contact.work_phone_number || "N/A"} / ${contact.mobile_phone || "N/A"}`)}
      </div>

      {/* Row 2: Other Information */}
      <div className="info-row">
        <h3>Other Information</h3>
        {renderField("Birthday", contact.birthdate)}
        {renderField("Website", contact.website)}
        {renderField("City", contact.city)}
        {renderField("Cell Phone Number", contact.cell_phone_number)}
        {renderField("Notes", contact.notes)}
        {renderField("State", contact.state)}
        {renderField("Zip Code", contact.zip_code)}


        {/* {renderField("Preferred Language", contact.preferred_language)} */}
        {/* {renderField("Insurance Company", contact.insurance_company)}
        {renderField("Insured Property", contact.insured_property)}
        {renderField("Brief Description of the Loss", contact.brief_description_of_the_loss)}
        {renderField("Mailing Address (if different)", contact.mailing_address_if_different_from_above)}
        {renderField("Have the Claim Been Reported?", contact.have_the_claim_been_reported)}
        {renderField("Policy Number", contact.policy_number)}
        {renderField("Claim Number", contact.claim_number)}
        {renderField("Date of Loss", contact.date_of_loss)}
        {renderField("Public Adjuster (if applicable)", contact.public_adjuster_if_applicable)}
        {renderField(
          "Have you contacted another attorney? If so, what is their name?",
          contact.another_attorney_name
        )} */}
      </div>

      {/* Row 3: Private Notes */}
      {/* <div className="info-row">
        <h3>Private Notes</h3>
        {privateNotes && privateNotes.length > 0 ? (
          privateNotes.map((note, index) => <p key={index}>{note}</p>)
        ) : (
          <p>No private notes available.</p>
        )}
      </div> */}
    </div>
  );
};

export default ContactInfoTab;