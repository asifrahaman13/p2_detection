prompt_builder = """You are helpful AI assistant. You will be given certain text. Your job is to extract out the following data all in key value pairs. If there are multiple values then they should not be list everything should be key value pairs. The entities and the description is as follows:\n
{descriptions}
Give the result in a json format only.\n
Everything should be key value pairs only. and should contain the following entities only. \n
The key should strictly be the actual text and the value should be the generic placeholders like the following.\n
{replacement}
=======================================================\n\n

*IMPORTANT: Only give the json formatted text and no other response. Your response should be ready to be converted to json.\n
*IMPORTANT: Only consider the given entities you are asked for. \n
*IMPORTANT: Do not give unnecessary key value pairs other then the format given to you.\n
*IMPORTANT: The results most likelly should not contain any long phrases like "equity investments at fair value through other comprehensive income", "deposits in margin accounts", or having more than one entitye like "moldova ms elena matveeva",  "romania ms diana blindu" etc.\n
*IMPORTANT: One key value pair should be one entity. For example "bulgaria ms milena boykova" is invalid.

=======================================================================================>\n
The given text is: {text}.
"""
