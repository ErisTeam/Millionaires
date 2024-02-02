package main

import (
	"strconv"
	"time"
)

// epoch is int64 1638316800000, which is 2021-12-01 00:00:00 UTC
// time.Date(2022, 0, 1, 0, 0, 0, 0, time.UTC).UnixMilli()
const epoch = 1638316800000
const TYPE_BITS = 4
const MAX_TYPE = 15
const BATCH_BITS = 17
const MAX_BATCH = 131071

var numberInBatch int64 = 0

type SnowflakeType int

const (
	SF_USER SnowflakeType = iota
	SF_VERIFICATION
	SF_POST
	SF_LIKE
	SF_FOLLOW
	SF_MESSAGE
	SF_ATTACHMENT
	SF_BOOKMARK
	SF_CHAT
	SF_TOKEN
	SF_RUN
	SF_TWELVE
	SF_THIRTEEN
	SF_FOURTEEN
	SF_FIFTEEN
	SF_OTHER
)

func (s SnowflakeType) String() string {
	return [...]string{"USER", "VERIFICATION", "POST", "LIKE", "FOLLOW", "MESSAGE", "ATTACHMENT", "BOOKMARK", "CHAT", "TOKEN", "RUN", "OTHER", "OTHER", "OTHER", "OTHER", "OTHER"}[s]
}

type Snowflake struct {
	ID            int64
	Date          time.Time
	NumberInBatch int64
	IDType        SnowflakeType
}

func (s Snowflake) StringIDBin() string {
	return strconv.FormatInt(s.ID, 2)
}
func (s Snowflake) StringIDDec() string {
	return strconv.FormatInt(s.ID, 10)
}

func newSnowflake(IDType SnowflakeType) Snowflake {
	var currentDate = time.Now().UnixMilli()

	var ID = ((((currentDate - epoch) << BATCH_BITS) | numberInBatch) << TYPE_BITS) | int64(IDType)

	var snowflake = Snowflake{ID: ID,
		Date: time.UnixMilli(currentDate),

		NumberInBatch: numberInBatch,
		IDType:        IDType}

	numberInBatch++
	if numberInBatch == MAX_BATCH+1 {
		numberInBatch = 0
	}
	println("GENERATED: ", snowflake.StringIDDec())

	return snowflake

}

func snowflakeFromInt(input int64) Snowflake {
	return Snowflake{ID: input,
		Date:          time.UnixMilli((input >> (TYPE_BITS + BATCH_BITS)) + epoch),
		NumberInBatch: input >> TYPE_BITS & MAX_BATCH,
		IDType:        SnowflakeType(input & MAX_TYPE)}
}
