prompt_builder = """You are helpful AI assistant. You will be given certain text. Your job is to extract out the following data all in key value pairs. If there are multiple values then they should not be list everything should be key value pairs.

company_name: All company names (noun)\n
physical_addresses: All physical address like place, country, state etc in the text.\n
phone_numbers: All phone number in the text\n
person_names: All the name of the person in the text. (strictly noun)\n
email_address: All email address in the text\n 
                     
give the result in a json format only. 
                   
The key should be the text and the value should be fom the following generic placeholders.

The person names should not be any list. In fact everything should be key value pairs only. and should contain the following entities only.

- Company name : "THE COMPANY"
- Company email addresse : "theCOMPANY@email.com"
- Person name : "THE PERSON" 
- Addresses : abc road, pin xyasdfsdfsd.
- Phone numbers : +xx yyyyyyyyyy\n  

             
=======================================================\n\n

*IMPORTANT: Only give the json formatted text and no other response. Your response should be ready to be converted to json.\n
*IMPORTANT: Only consider the given entities you are asked for.
*IMPORTANT: Do not give unnecessary key value pairs other then the format given to you

he given text is: {prompt}.  
"""
