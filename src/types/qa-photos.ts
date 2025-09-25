export interface QAPhotoReview {
  id: string;
  drop_number: string;
  review_date: string;
  user_name: string;
  
  // Step completion fields
  step_01_property_frontage: boolean;
  step_02_location_before_install: boolean;
  step_03_outside_cable_span: boolean;
  step_04_home_entry_outside: boolean;
  step_05_home_entry_inside: boolean;
  step_06_fibre_entry_to_ont: boolean;
  step_07_patched_labelled_drop: boolean;
  step_08_work_area_completion: boolean;
  step_09_ont_barcode_scan: boolean;
  step_10_ups_serial_number: boolean;
  step_11_powermeter_reading: boolean;
  step_12_powermeter_at_ont: boolean;
  step_13_active_broadband_light: boolean;
  step_14_customer_signature: boolean;
  
  // Summary fields (calculated by database)
  completed_photos: number;
  outstanding_photos: number;
  
  outstanding_photos_loaded_to_1map: boolean;
  comment?: string;
  
  created_at: string;
  updated_at: string;
}

export interface QAReviewStep {
  id: string;
  step_number: number;
  step_title: string;
  step_description: string;
}

export interface QAPhotoReviewCreate {
  drop_number: string;
  review_date?: string; // Defaults to current date
  user_name: string;
  
  // All step fields optional with defaults to false
  step_01_property_frontage?: boolean;
  step_02_location_before_install?: boolean;
  step_03_outside_cable_span?: boolean;
  step_04_home_entry_outside?: boolean;
  step_05_home_entry_inside?: boolean;
  step_06_fibre_entry_to_ont?: boolean;
  step_07_patched_labelled_drop?: boolean;
  step_08_work_area_completion?: boolean;
  step_09_ont_barcode_scan?: boolean;
  step_10_ups_serial_number?: boolean;
  step_11_powermeter_reading?: boolean;
  step_12_powermeter_at_ont?: boolean;
  step_13_active_broadband_light?: boolean;
  step_14_customer_signature?: boolean;
  
  outstanding_photos_loaded_to_1map?: boolean;
  comment?: string;
}

export interface QAPhotoReviewUpdate {
  id: string;
  step_01_property_frontage?: boolean;
  step_02_location_before_install?: boolean;
  step_03_outside_cable_span?: boolean;
  step_04_home_entry_outside?: boolean;
  step_05_home_entry_inside?: boolean;
  step_06_fibre_entry_to_ont?: boolean;
  step_07_patched_labelled_drop?: boolean;
  step_08_work_area_completion?: boolean;
  step_09_ont_barcode_scan?: boolean;
  step_10_ups_serial_number?: boolean;
  step_11_powermeter_reading?: boolean;
  step_12_powermeter_at_ont?: boolean;
  step_13_active_broadband_light?: boolean;
  step_14_customer_signature?: boolean;
  
  outstanding_photos_loaded_to_1map?: boolean;
  comment?: string;
}

// Helper function to get step field names
export const QA_STEP_FIELDS = [
  'step_01_property_frontage',
  'step_02_location_before_install',
  'step_03_outside_cable_span',
  'step_04_home_entry_outside',
  'step_05_home_entry_inside',
  'step_06_fibre_entry_to_ont',
  'step_07_patched_labelled_drop',
  'step_08_work_area_completion',
  'step_09_ont_barcode_scan',
  'step_10_ups_serial_number',
  'step_11_powermeter_reading',
  'step_12_powermeter_at_ont',
  'step_13_active_broadband_light',
  'step_14_customer_signature'
] as const;

export type QAStepField = typeof QA_STEP_FIELDS[number];