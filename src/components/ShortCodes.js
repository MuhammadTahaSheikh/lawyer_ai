import React, { useState } from 'react';
import { Table, IconButton, Input } from '@mui/joy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const extraFields = {
  // current_date: 'current_date_long_str',
  current_date_short: 'current_date_short_str',
  current_date_long: 'current_date_long',
};
const fields = {
  // ===== OLD FIELDS (COMMENTED OUT) =====
  // '116550': 'mailing_address',
  // '116551': 'plaintiff',
  // '116552': 'defendant',
  // '116553': 'insured_property',
  // '116554': 'policy_number',
  // '116555': 'claim_number',
  // '1063265': 'defense_attorney',
  // '1063266': 'defense_attorney_firm',
  // '116562': 'ocs_phone_number',
  // '116563': 'ocs_service_email',
  // '1063269': 'ocs_direct_email',
  // '116565': 'clients_phone_number',
  // '116566': 'judge',
  // '116567': 'division',
  // '116568': 'type_of_loss_automated',
  // '116569': 'clients_email',
  // '116917': 'ocs_fax_number',
  // '116925': 'date_of_loss',
  // '116927': 'public_adjusters',
  // '116928': 'county',
  // '117979': 'personal_representative',
  // '117981': 'assigned_attorney',
  // '155961': 'plaintiff_2',
  // '156985': 'origination_credit',
  // '184041': 'indemnity_settlement',
  // '184043': 'attorneys_fee_settlement',
  // '186877': 'paralegal_assignment',
  // '186878': 'responses_to_plaintiffs_discovery_due',
  // '186879': 'responses_to_defendants_discovery_due',
  // '191390': 'settlement_date',
  // '213551': 'insurance_company',
  // '213552': 'insured_property',
  // '213553': 'mailing_address',
  // '213554': 'insurance_policy_number',
  // '213555': 'claim_number',
  // '213556': 'date_of_damage',
  // '213557': 'public_adjusters',
  // '213558': 'brief_description_of_the_loss',
  // '213560': 'have_the_claim_been_reported',
  // '213561': 'contacted_another_attorney_name',
  // '213565': 'preferred_language',
  // '217575': 'defendant_discovery_responses_received',
  // '228742': "prosecutor's_name",
  // '228743': 'date_of_arrest',
  // '228745': 'arrest_number',
  // '228746': 'co_defendants',
  // '228747': "state_attorney's_office",
  // '228749': 'payment_status',
  // '236184': 'injured_party',
  // '236186': 'treating_doctor',
  // '236190': "client's_examination_date",
  // '236192': "client's_(pip)_car_insurance_company",
  // '236193': 'at_fault_party_insurance_company',
  // '246956': 'scheduling_assignment',
  // '256892': 'at_fault_party',
  // '264720': 'clients_birthday',
  // '264721': 'social_security_number',
  // '264722': 'clients_home_address',
  // '264723': "client's_health_insurance_name",
  // '264768': 'pip_claim_number',
  // '264769': 'at_fault_carrier_claim_number',
  // '264776': 'location_of_accident',
  // '281321': 'depo_request_fa',
  // '281327': 'hearing_request_mtc',
  // '281382': 'depo_request_cr',
  // '281384': 'hearing_request_cmc',
  // '281385': 'hearing_request_mtd',
  // '379180': 'case_evaluation',
  // '455249': 'coverage_determination',
  // '467573': 'aob_type',
  // '494083': 'hearing_type',
  // '494161': "insured's_phone_number",
  // '494162': "insured's_email",
  // '10631901': 'case_number',
  // '10631902': 'name',
  // '10631903': 'contact_first_name',
  // '10631904': 'contact_last_name',
  // '10631905': 'contact_full_name',
  // '10631906': 'opened_date',
  // '10631907': 'contact_address_city',
  // '10631908': 'contact_address_state',
  // '10631909': 'contact_address_zip_code',
  // '106319010': 'contact_address_street',
  // '106319011': 'company_name',
  // '106319012': 'company_work_phone',
  // '106319013': 'company_fax',
  // '106319014': 'description',
  // '1063450': 'mortgage_company',
  // '1063331': "paralegal_assignment's_email",
  // '1063318': 'assigned_attorneys_email',

  // ===== NEW FIELDS FROM CSV =====
  '213551': 'insurance_company',
  '213553': 'mailing_address_if_different_from_above',
  '213555': 'claim_number',
  '213557': 'public_adjuster_if_applicable',
  '213558': 'brief_description_of_the_loss',
  '213560': 'have_the_claim_been_reported',
  '213561': 'have_you_contacted_another_attorney_if_so_what_is_their_name',
  '213565': 'preferred_language',
  '236185': 'hospital',
  '281321': 'depo',
  '744700': 'invoice',
  '1063191': 'status',
  '1063193': 'updated_field_name',
  '1063199': 'test_contact',
  '1063207': 'add_test_companies',
  '1063208': 'contact_test',
  '1063209': 'add_companies_test',
  '1063210': 'sas',
  '1063256': 'mailing_address',
  '1063259': 'plaintiff',
  '1063260': 'defendant',
  '1063261': 'insured_property',
  '1063262': 'policy_number',
  '1063263': 'claim_number',
  '1063265': 'defense_attorney',
  '1063266': 'defense_attorney_firm',
  '1063267': 'ocs_phone_number',
  '1063268': 'ocs_service_email',
  '1063269': 'ocs_direct_email',
  '1063270': 'clients_phone_number',
  '1063271': 'judge',
  '1063272': 'local_ssa_office_phone_#',
  '1063274': 'clients_email',
  '1063275': 'ocs_fax_number',
  '1063276': 'date_of_loss',
  '1063277': 'public_adjusters',
  '1063278': 'personal_representative',
  '1063281': 'indemnity_settlement',
  '1063282': 'attorneys_fee_settlement',
  '1063283': 'paralegal_assignment',
  '1063284': 'responses_to_plaintiffs_discovery_due',
  '1063285': 'responses_to_defendants_discovery_due',
  '1063286': 'settlement_date',
  '1063288': "prosecutor's_name",
  '1063289': 'date_of_arrest',
  '1063290': 'arrest_number',
  '1063291': "state_attorney's_office",
  '1063292': 'injured_party',
  '1063293': 'treating_doctor',
  '1063294': "client's_examination_date",
  '1063295': "client's_(pip)_car_insurance_company",
  '1063296': 'at_fault_party_insurance_company',
  '1063297': 'scheduling_assignment',
  '1063298': 'at_fault_party',
  '1063299': 'social_security_number',
  '1063301': "client's_health_insurance_name",
  '1063302': 'pip_claim_number',
  '1063303': 'at_fault_carrier_claim_number',
  '1063304': 'location_of_accident',
  '1063305': 'depo_request_fa',
  '1063306': 'hearing_request_mtc',
  '1063307': 'depo_request_cr',
  '1063308': 'case_evaluation',
  '1063310': 'aob_type',
  '1063311': 'hearing_type',
  '1063313': "insured's_phone_number",
  '1063314': "insured's_email",
  '1063315': 'lastrequest_(fa)',
  '1063316': 'last_request_(mtc)',
  '1063317': 'lastrequest_(mtd)',
  '1063318': 'assigned_attorneys_email',
  '1063319': 'schedulers_email',
  '1063320': 'pa_estimate',
  '1063321': 'applicable_deductible',
  '1063322': 'last_offer_of_settlement',
  '1063323': 'pfs_offer_(combine_if_more_than_one_plaintiff)',
  '1063324': 'aob/dtp_invoice_amount',
  '1063325': 'undisputed/prior_payment',
  '1063326': "attorney's_last_contact_w/oc",
  '1063329': 'time_entry_amount',
  '1063330': 'case_costs',
  '1063331': "paralegal_assignment's_email",
  '1063336': 'calendar_call',
  '1063338': 'msj_hearing_date',
  '1063339': 'defs_mfext_filed_disco',
  '1063340': 'defs_mfext_filed_complaint',
  '1063341': 'plaintiffs_mfext_filed_disco',
  '1063342': 'defs_agreed_order_disco',
  '1063343': "def's_agreed_order_(complaint)",
  '1063344': 'plaintiffs_agreed_order_disco',
  '1063345': 'case_manager',
  '1063346': 'expert_fees_1',
  '1063347': 'expert_fees_2',
  '1063348': 'expert_fees_3',
  '1063349': 'discovery_paralegal',
  '1063350': 'flagged_for_review',
  '1063351': 'intake_attorney',
  '1063352': 'pa_fee',
  '1063353': "def's_expert_disco_due_date",
  '1063354': "plaintiff's_expert_disco_due_date",
  '1063355': 'discovery_attorney',
  '1063356': 'settlement_status',
  '1063357': 'aob_reviewed',
  '1063358': 'benefit_type',
  '1063359': 'claim_status_(ssa)',
  '1063360': 'medical_record_last_requested',
  '1063361': 'date_medical_record_received',
  '1063362': 'intake_specialist',
  '1063363': 'claim_status_date_(ssi/ssdi)',
  '1063364': 'form_1696_password',
  '1063365': 'local_ssa_office_address',
  '1063366': 'local_ssa_office_fax_#',
  '1063367': "ia/fa's_name",
  '1063368': "ia/fa's_email",
  '1063369': 'lawsuit_filed_date',
  '1063370': 'mediation_dates',
  '1063371': 'retainer_source',
  '1063372': 'initial_demand_sent',
  '1063374': 'demand_requested',
  '1063377': '1696_processed',
  '1063378': 'retainer_type',
  '1063379': 'dfs_mediation_date',
  '1063382': 'ere_access',
  '1063383': 'emergency_contact_name',
  '1063384': 'emergency_contact_phone_number',
  '1063385': 'emergency_contact_email',
  '1063386': 'emergency_contact_address',
  '1063387': 'form_1696_status',
  '1063389': 'ssa_followup',
  '1063390': 'pre_lit_paralegal',
  '1063391': 'defendant_discovery_responses_received',
  '1063392': 'coverage_determination',
  '1063393': 'type_of_loss_specify',
  '1063394': 'type_of_loss_automated',
  '1063395': 'payment_93',
  '1063396': 'county',
  '1063397': 'division',
  '1063400': 'trial_period_start_date',
  '1063401': 'contact_first_name',
  '1063404': 'contact_last_name',
  '1063405': 'contact_full_name',
  '1063407': 'clients_birthday',
  '1063408': 'hearing_request_mtd',
  '1063409': 'hearing_request_cmc',
  '1063410': 'plaintiff_disco_responses_sent',
  '1063411': 'last_request_cr',
  '1063412': 'last_request_cmc',
  '1063413': 'plaintiff_2',
  '1063414': 'ia_fas_name',
  '1063415': 'ia_fas_email',
  '1063416': 'demand_follow_up',
  '1063417': 'mfext_dl_disco_ours',
  '1063418': 'insurance_company',
  '1063419': 'brief_description_of_the_loss',
  '1063420': 'have_the_claim_been_reported',
  '1063421': 'contacted_another_attorney_name',
  '1063422': 'preferred_language',
  '1063424': 'co_defendants',
  '1063425': 'payment_status',
  '1063426': 'clients_home_address',
  '1063427': 'mfext_deadline_answer',
  '1063428': 'mfext_dl_disco_theirs',
  '1063429': 'form_1696_processed',
  '1063430': 'contact_address_city',
  '1063431': 'contact_address_state',
  '1063432': 'contact_address_street',
  '1063433': 'contact_address_zip_code',
  '1063434': 'company_name',
  '1063435': 'company_work_phone',
  '1063436': 'company_fax',
  '1063443': 'letter_to_client_sent',
  '1063444': 'lor_to_carrier',
  '1063447': '10k_policy_limit',
  '1063448': 'state',
  '1063449': 'cardenas_origination',
  '1063450': 'mortgage_company',
  '1063451': 'settlement_draft',
  '1063452': 'restoration_company_1',
  '1063454': 'aob/dtp_invoice_1',
  '1063455': 'restoration_company_2',
  '1063456': 'aob/dtp_invoice_2',
  '1063457': 'restoration_company_3',
  '1063458': 'aob/dtp_invoice_3',
  '1063459': 'demand_total_amount',
  '1063460': 'policy_copy_sent',
  '1063461': 'ssa_case_id_no.',
  '1063462': 'ssa_claim_specialist_phone_no.',
  '1063463': 'ssa_claim_specialist_phone',
  '1063467': "p's_pfs_sent",
  '1063468': 'ssd_id_number',
  '1063469': 'ssd_rep_direct_line',
  '1063470': 'ssd_rep_name',
  '1063489': 'public_adjuster_email',
  '1063501': 'projected_trial_date',
  '1063502': 'ptc_date',
  '10631901': 'case_number',
};

const combinedFields = {
  ...extraFields,
  ...fields,
};

function ShortCodes() {
  const [search, setSearch] = useState('');

  const sortedEntries = Object.entries(combinedFields).sort((a, b) =>
    a[1].localeCompare(b[1])
  );

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`Copied: ${text}`);
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Shortcodes Table</h2>
      <Input
  placeholder="Search by field name or shortcode..."
  value={search}
  onChange={(e) => setSearch((e.target.value || "").toLowerCase())}
  sx={{ mb: 2, width: 400 }}
/>

      <Table variant="outlined" borderAxis="both">
        <thead>
          <tr>
            <th>Custom Field</th>
            <th>Shortcode</th>
            <th>Copy</th>
          </tr>
        </thead>
        <tbody>
       {sortedEntries
  .filter(([id, name]) => {
    const isExtra = Object.values(extraFields).includes(name);
    const shortcode = isExtra
      ? `{{ general["${name}"] }}`
      : `{{ case["${id}"] }}`;

    return (
      name.toLowerCase().includes(search) ||
      shortcode.toLowerCase().includes(search)
    );
  })
  .map(([id, name]) => {
    const isExtra = Object.values(extraFields).includes(name);
    const shortcode = isExtra
      ? `{{ general["${name}"] }}`
      : `{{ case["${id}"] }}`;

    return (
      <tr key={id}>
        <td>{name}</td>
        <td>{shortcode}</td>
        <td>
          <IconButton
            size="sm"
            variant="outlined"
            onClick={() => handleCopy(shortcode)}
          >
            <ContentCopyIcon />
          </IconButton>
        </td>
      </tr>
    );
  })}



        </tbody>
      </Table>
    </div>
  );
}

export default ShortCodes;
