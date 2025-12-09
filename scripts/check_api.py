import openai
from dotenv import load_dotenv
import os
from pathlib import Path

# Load .env from the project root
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

def check_openai_api():
    api_key = os.getenv("OPENAI_API_KEY")
    base_url= os.getenv("OPENAI_API_BASE_URL", "https://api.openai.com/v1")
    print(f"Using OpenAI API Base URL: {base_url}")
    print(f"Using Model: {os.getenv('MODEL', 'gpt-3.5-turbo')}")
    model = os.getenv("MODEL", "gpt-3.5-turbo")
    try:
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello, how are you?"}
            ]
        )
        print("API call successful. Response:")
        print(response)
    except Exception as e:
        print("Error occurred while accessing OpenAI API:")
        print(e)
if __name__ == "__main__":
    check_openai_api()