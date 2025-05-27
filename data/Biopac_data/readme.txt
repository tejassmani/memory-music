

The folders include raw physiological signals recorded via Biopac configuration for all the studied subjects. The recorded signals include: 

	o Electrodermal Activity (EDA) stored in "EDA" folder o Electrocardiogram (ECG) stored in "ECG" folder.

	o Photoplethysmography (PPG) stored in "PPG" folder o Respiration (RESP) stored in "RESP" folder. 

	o Electromyogram (EMG) stored in "EMG" folder. 

data saved as {"Subject number","gender_”,”type of data (e.g., EDA, ECG)”} in CSV format. 

The Timing folder includes the trigger information with respect to onset of Biopac recording:
	o for each block saved as: {"Subject number","gender","_Triggers_block.csv"} 
	o for each trial saved as: {"Subject number","gender","_Triggers_trial.xlsx"} 

Timing information can be used for the purpose of synchronization.

The raw Biopac data has the sampling frequency of 2 kHz, and recordings start from 0. 
