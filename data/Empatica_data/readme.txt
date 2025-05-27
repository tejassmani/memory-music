

Physiological signals collected via the Empatica device are stored in “Empatica data" in the ".csv" format. The data collected via Empatica device for each subject can be found in the subject's folder (e.g., "Subject_3F). In the subject's folders, .csv files in this archive are in the following format: 

	• The first row is the initial time of the session expressed as a de-identified timestamp with respect to the unix timestamp in UTC. The second row is the sample rate expressed in Hz.

		o TEMP.csv: Data from temperature sensor expressed degrees on the Celsius (°C) scale.

		o EDA.csv: Data from the electrodermal activity sensor expressed as microsiemens (μS).

		o BVP.csv: Data from photoplethysmograph.

		o ACC.csv: Data from 3-axis accelerometer sensor. The accelerometer is configured to measure acceleration in the range [-2g, 2g]. Therefore, the unit in this file is 1/64g. Data from x, y, and z axis are respectively in the first, second, and third columns.

		o IBI.csv: Time between individuals heart beats extracted from the BVP signal. No sample rate is needed for this file. The first column is the time (with respect to the initial time) of the detected inter-beat interval expressed in seconds (s). The second column is the duration in seconds (s) of the detected inter-beat interval (i.e., the distance in seconds from the previous beat).

		o HR.csv: Average heart rate extracted from the BVP signal. The first row is the initial time of the session expressed as unix timestamp in UTC. The second row is the sample rate expressed in Hz.

		o tags.csv: Event mark times. Each row corresponds to a physical button press on the device; the same time as the status LED is first illuminated. The time is expressed as a de-identified timestamp with respect to the unix timestamp in UTC; and it is synchronized with the initial time of the session indicated in the related data files from the corresponding session.
