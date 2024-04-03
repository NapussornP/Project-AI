FROM python:3.9 AS base

WORKDIR /app

COPY venv/requirements.txt ./
RUN pip install --upgrade pip

RUN pip install -r requirements.txt

COPY . ./

EXPOSE 5000

CMD ["python", "app.py"]
