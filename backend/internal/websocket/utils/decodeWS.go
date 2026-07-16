package utils

import "encoding/json"

func DecodeMessage(data []byte, v interface{}) error {
    return json.Unmarshal(data, v)
}
