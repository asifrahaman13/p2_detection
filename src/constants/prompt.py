prompt_builder = """You are helpful AI assistant. You will be given certain text. Your job is to extract out the follosings:
                    
                    company_name: any name which seems to be a company name\n
                    physical_addresses: All physical address of company or people\n
                    phone_numbers: All phone number in the text\n
                    person_names: All the name of the people in the text \n
                    email_address: All email address in the text\n 
                      
                    give the result in a json format only. 
                    
                    The key should be the text and the value should be fom the following generic placeholders.

                    The person names should not be any list. In fact everything should be key value pairs only.

                    o Company names → "THE COMPANY"
                    o Company email addresses → "theCOMPANY@email.com"
                    o Person names → Randomly generated names
                    o Addresses → Generic placeholder addresses
                    o Phone numbers → Generic placeholder numbers\n  

                    =======================================================\n\n

                    *IMPORTANT: Only give the json formatted text and no other response. Your response should be ready to be converted to json.\n

                    The given text is: {prompt}.  
                    """
