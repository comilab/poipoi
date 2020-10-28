<?php

namespace App\Http\Requests;

use Illuminate\Support\Str;

trait CamelCaseKeys
{
    public function snakeCasedAll(): array
    {
        return $this->convertKeysToSnakeCase($this->all());
    }

    public function snakeCasedValidated(): array
    {
        return $this->convertKeysToSnakeCase($this->validated());
    }

    protected function convertKeysToSnakeCase(array $array): array
    {
        $result = [];

        foreach ($array as $key => $value) {
            $newKey = Str::snake($key);
            if (is_array($value)) {
                $result[$newKey] = $this->convertKeysToSnakeCase($value);
            } else {
                $result[$newKey] = $value;
            }
        }

        return $result;
    }
}
