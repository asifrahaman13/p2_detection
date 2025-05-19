prompt_builder = """You are helpful AI assistant. You will be given certain text. Your job is to extract out the following data all in key value pairs. If there are multiple values then they should not be list everything should be key value pairs.

company_name: All company names (noun)\n
physical_addresses: All compnay physical address in the text like "3a fragkokklisias granikou str marousi athens gr 15125 greece".\n
phone_numbers: All phone number in the text including +\n
person_names: All the name of the person in the text. (strictly noun)\n
email_address: All email address in the text\n

give the result in a json format only.

The key should be the text and the value should be fom the following generic placeholders.

The person names should not be any list. In fact everything should be key value pairs only. and should contain the following entities only. The key should be the actual text and the value should be the generic placeholders.

- Actual company name : "THE COMPANY"\n
- Actual company email addresse : "theCOMPANY@email.com"\n
- Acutal person name : "THE PERSON"\n
- Actual addresses : "THE ADDRESS".\n
- Actual phone numbers : +xx yyyyyyyyyy\n


=======================================================\n\n

*IMPORTANT: Only give the json formatted text and no other response. Your response should be ready to be converted to json.\n
*IMPORTANT: Only consider the given entities you are asked for. \n
*IMPORTANT: Do not give unnecessary key value pairs other then the format given to you.\n
*IMPORTANT: The results most likelly should not contain any long phrases like "equity investments at fair value through other comprehensive income", "deposits in margin accounts", or having more than one entitye like "moldova ms elena matveeva",  "romania ms diana blindu" etc.\n
*IMPORTANT: One key value pair should be one entity. For example "bulgaria ms milena boykova" is invalid. 

=======================================================================================>\n
The given text is: {prompt}.
"""
