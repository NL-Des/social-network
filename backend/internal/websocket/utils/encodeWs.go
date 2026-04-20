package utils

import "encoding/json"

func EncodeMessage(msg interface{}) ([]byte, error) {
    return json.Marshal(msg)
}
