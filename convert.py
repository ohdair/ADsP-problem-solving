import json

def convert(file_path, explanation_path):
    """
    explanation을 추가하기 위한 메서드\n
    json 형식의 문제 파일 내 explanation이라는 속성 값을 추가합니다.
    """
    with open(file_path, 'r', encoding="utf-8") as json_file:
        data = json.load(json_file)

    with open(explanation_path, 'r', encoding="utf-8") as txt_file:
        lines = txt_file.readlines()

    for line, d in zip(lines, data['questions']):
        d['explanation'] = line.strip().split('. ')[1]

    with open(file_path, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)