from langchain_core.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI
from generation.generation_template import GenerationModel
from dotenv import load_dotenv
import os
import json
import argparse
import logging

# Load dotenv
load_dotenv()

data_path = os.path.join(os.path.dirname(
    os.path.abspath('.env')), os.getenv('DATA_PATH'))
out_path = os.path.join(os.path.dirname(
    os.path.abspath('.env')), os.getenv('OUT_PATH'))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def is_json_serializable(obj):
    try:
        json.dumps(obj)
        return True
    except (TypeError, OverflowError):
        return False


def generate_chain(transcript_file, out_file):
    with open(os.path.join(data_path, transcript_file), 'r') as f:
        lines = f.readlines()

    query = "根据治疗记录，按照以下说明总结患者的个人病史。“客户”并不是指记录中的患者。.\n\n{lines}".format(
        lines=lines)
 
    pydantic_parser = PydanticOutputParser(
        pydantic_object=GenerationModel.CognitiveConceptualizationDiagram)
 
    _input = GenerationModel.prompt_template.invoke({
        "query": query,
        "format_instructions": pydantic_parser.get_format_instructions()
    })
    print(_input)
   
    llm = ChatOpenAI(
        api_key=os.getenv("OPENAI_API_KEY"), # 如果您没有配置环境变量，请在此处用您的API Key进行替换
        base_url=os.getenv("BASE_URL"),
        model=os.getenv("GENERATOR_MODEL")
    )
    attempts = 0
    response = llm.invoke(_input)
    # print(response.content)
    # exit()
    # print("111111")
    while attempts < int(os.getenv('MAX_ATTEMPTS')):
        _output = pydantic_parser.parse(
            response.content).model_dump()
        print(_output)
        if is_json_serializable(_output):
            with open(os.path.join(out_path, out_file), 'w', encoding='utf-8') as f:
                f.write(json.dumps(_output, indent=4, ensure_ascii=False))
            logger.info(f"Output successfully written to {out_file}")
            break
        else:
            attempts += 1
            logger.warning(
                f"Output is not JSON serializable. Attempting {attempts}/{int(os.getenv('MAX_ATTEMPTS'))}")
            if attempts == int(os.getenv('MAX_ATTEMPTS')):
                logger.error(
                    "Max attempts reached. Could not generate a JSON serializable output.")
                raise ValueError(
                    "Could not generate a JSON serializable output after maximum attempts.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--transcript-file', type=str,
                        default="example_transcript.txt")
    parser.add_argument('--out-file', type=str,
                        default="example_CCD_from_transcript.json")
    args = parser.parse_args()
    generate_chain(args.transcript_file, args.out_file)


if __name__ == "__main__":
    main()
