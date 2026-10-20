
import { View, Text } from "react-native";
import {
  WeatherCardProps,
  TingkatAQI,
} from "../../types/cuaca";
import { typeScale, spacing } from "../constants/styles";

const warnaPerTingkat: Record<TingkatAQI, string> = {
  BAIK: "green",
  SEDANG: "goldenrod",
  TIDAK_SEHAT: "orange",
  BERBAHAYA: "crimson",
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
  suhuMaksimal,
  suhuMinimal,
  pm25,
  pm10,
}: WeatherCardProps) {
  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${tingkatAQI})`
      : `AQI: ${tingkatAQI}`;

  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang,
        borderRadius: 8,
        backgroundColor: "#F4F7FA",
        gap: 8,
      }}
    >
      {/* Nama kota dan suhu saat ini */}
      <Text
        style={{
          fontWeight: "bold",
          fontSize: typeScale.judul,
        }}
      >
        {kota}
      </Text>

      <Text style={{ fontSize: 32 }}>
        {suhu}°C
      </Text>

      {/* Status kualitas udara */}
      <Text
        style={{
          color: warnaPerTingkat[tingkatAQI],
          fontSize: typeScale.isi,
        }}
      >
        {teksAQI}
      </Text>

      {/* Suhu maksimal dan minimal hari ini */}
      {(suhuMaksimal !== undefined ||
        suhuMinimal !== undefined) && (
        <View style={{ gap: 4 }}>
          <Text style={{ fontWeight: "600" }}>
            Suhu hari ini
          </Text>

          {suhuMaksimal !== undefined && (
            <Text style={{ fontSize: 14, color: "#555" }}>
              Maksimal: {suhuMaksimal}°C
            </Text>
          )}

          {suhuMinimal !== undefined && (
            <Text style={{ fontSize: 14, color: "#555" }}>
              Minimal: {suhuMinimal}°C
            </Text>
          )}
        </View>
      )}

      {/* Informasi partikel polusi udara */}
      {(pm25 !== undefined || pm10 !== undefined) && (
        <View style={{ gap: 4 }}>
          <Text style={{ fontWeight: "600" }}>
            Partikel udara
          </Text>

          {pm25 !== undefined && (
            <Text style={{ fontSize: 12, color: "#888" }}>
              PM2.5: {pm25} µg/m³
            </Text>
          )}

          {pm10 !== undefined && (
            <Text style={{ fontSize: 12, color: "#888" }}>
              PM10: {pm10} µg/m³
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
