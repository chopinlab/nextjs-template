/*
  Warnings:

  - The primary key for the `sensor_data` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `time_series_data` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "sensor_data" DROP CONSTRAINT "sensor_data_pkey",
ADD CONSTRAINT "sensor_data_pkey" PRIMARY KEY ("id", "timestamp");

-- AlterTable
ALTER TABLE "time_series_data" DROP CONSTRAINT "time_series_data_pkey",
ADD CONSTRAINT "time_series_data_pkey" PRIMARY KEY ("id", "timestamp");
