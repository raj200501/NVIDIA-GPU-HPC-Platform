import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import org.apache.spark.sql.streaming.Trigger
import org.apache.spark.sql.types._

object BigDataProcessing {
  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder
      .appName("Big Data Processing")
      .master("local[*]")
      .getOrCreate()

    val schema = new StructType()
      .add("sensor_id", IntegerType)
      .add("temperature", DoubleType)
      .add("humidity", DoubleType)
      .add("timestamp", LongType)

    val inputStream = spark.readStream
      .schema(schema)
      .json("hdfs://localhost:9000/user/sensor_data")

    val processedStream = inputStream
      .withColumn("temperature_f", col("temperature") * 9 / 5 + 32)
      .withColumn("humidity_fraction", col("humidity") / 100)
      .withWatermark("timestamp", "10 minutes")
      .groupBy(window(col("timestamp").cast("timestamp"), "5 minutes"), col("sensor_id"))
      .agg(
        avg("temperature_f").alias("avg_temperature"),
        avg("humidity_fraction").alias("avg_humidity")
      )

    val query = processedStream.writeStream
      .outputMode("append")
      .format("console")
      .trigger(Trigger.ProcessingTime("10 seconds"))
      .start()

    query.awaitTermination()
  }
}
