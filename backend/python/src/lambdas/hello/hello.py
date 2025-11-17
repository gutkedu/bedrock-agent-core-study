import json


def handler(event, context):
    """Simple Hello World Lambda handler for testing integration with API Gateway.

    Returns a JSON body with a greeting and some context fields.
    """
    name = event.get("queryStringParameters", {}).get("name") if event else None
    if not name:
        name = "world"
    
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"message": f"Hello, {name}!"}),
    }
