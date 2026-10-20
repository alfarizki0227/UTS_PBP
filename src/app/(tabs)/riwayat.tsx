import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTema } from "../../context/ThemeContext";
import {
  ambilSemuaFavorit,
  hapusFavorit,
} from "../../services/favoritStorages";
import {
  ambilRiwayatPencarian,
  hapusCacheKota,
  hapusRiwayatPencarian,
} from "../../services/offlineCache";

import type { KotaFavorit } from "../../../types/favorit";
import type { HasilGeocoding } from "../../../types/geocoding";

export default function HalamanRiwayat() {
  const { warna } = useTema();

  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<HasilGeocoding[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  // Muat ulang riwayat pencarian dan favorit saat halaman dibuka.
  useFocusEffect(
    useCallback(() => {
      let masihAktif = true;

      async function muatData() {
        try {
          setSedangMemuat(true);

          const [favorit, riwayat] = await Promise.all([
            ambilSemuaFavorit(),
            ambilRiwayatPencarian(),
          ]);

          if (masihAktif) {
            setDaftarFavorit(favorit);
            setDaftarRiwayat(riwayat);
          }
        } catch (error) {
          console.error("Gagal memuat riwayat:", error);

          if (masihAktif) {
            Alert.alert(
              "Gagal",
              "Riwayat pencarian atau kota favorit tidak dapat dimuat.",
            );
          }
        } finally {
          if (masihAktif) {
            setSedangMemuat(false);
          }
        }
      }

      void muatData();

      return () => {
        masihAktif = false;
      };
    }, []),
  );

  // Hapus cache cuaca untuk koordinat kota.
  function konfirmasiHapusCache(
    latitude: number,
    longitude: number,
    nama: string,
  ) {
    Alert.alert(
      "Hapus Cache Kota",
      `Hapus cache cuaca untuk ${nama} dari perangkat?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Cache",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await hapusCacheKota(latitude, longitude);

                Alert.alert(
                  "Berhasil",
                  `Cache cuaca ${nama} berhasil dihapus.`,
                );
              } catch (error) {
                console.error("Gagal menghapus cache:", error);
                Alert.alert("Gagal", `Cache ${nama} gagal dihapus.`);
              }
            })();
          },
        },
      ],
    );
  }

  // Hapus kota dari riwayat pencarian.
  function konfirmasiHapusRiwayat(kota: HasilGeocoding) {
    Alert.alert("Hapus Riwayat", `Hapus ${kota.name} dari riwayat pencarian?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await hapusRiwayatPencarian(kota.latitude, kota.longitude);

              setDaftarRiwayat((sebelumnya) =>
                sebelumnya.filter(
                  (item) =>
                    item.latitude !== kota.latitude ||
                    item.longitude !== kota.longitude,
                ),
              );
            } catch (error) {
              console.error("Gagal menghapus riwayat:", error);
              Alert.alert("Gagal", "Riwayat tidak berhasil dihapus.");
            }
          })();
        },
      },
    ]);
  }

  // Hapus kota dari daftar favorit saja.
  function konfirmasiHapusFavorit(kota: KotaFavorit) {
    Alert.alert(
      "Hapus Kota Favorit",
      `Hapus ${kota.nama} dari daftar favorit? Cache cuacanya tidak ikut dihapus.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Favorit",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await hapusFavorit(kota.id);

                setDaftarFavorit((sebelumnya) =>
                  sebelumnya.filter((item) => item.id !== kota.id),
                );
              } catch (error) {
                console.error("Gagal menghapus favorit:", error);
                Alert.alert("Gagal", "Kota favorit gagal dihapus.");
              }
            })();
          },
        },
      ],
    );
  }

  // Buka Beranda dengan membawa kota yang dipilih.
  function bukaKota(kota: HasilGeocoding) {
    router.navigate({
      pathname: "/",
      params: {
        kotaId: String(kota.id ?? ""),
        namaKota: kota.name,
        latitude: String(kota.latitude),
        longitude: String(kota.longitude),
        negara: kota.country ?? "",
        wilayah: kota.admin1 ?? "",
      },
    });
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: warna.latar,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          gap: 12,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: warna.teks,
          }}
        >
          Riwayat Pencarian
        </Text>

        <Text style={{ color: warna.teksSekunder }}>
          Maksimal 10 kota yang terakhir dicari.
        </Text>

        {sedangMemuat ? (
          <Text style={{ color: warna.teks }}>Memuat riwayat...</Text>
        ) : daftarRiwayat.length === 0 ? (
          <Text style={{ color: warna.teks }}>
            Belum ada riwayat pencarian. Cari kota dari halaman Beranda terlebih
            dahulu.
          </Text>
        ) : (
          daftarRiwayat.map((kota) => (
            <View
              key={`${kota.latitude}_${kota.longitude}`}
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: warna.garis,
                borderRadius: 8,
                backgroundColor: warna.kartu,
                gap: 8,
              }}
            >
              <TouchableOpacity onPress={() => bukaKota(kota)}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: warna.teks,
                  }}
                >
                  {kota.name}
                </Text>

                <Text style={{ color: warna.teksSekunder }}>
                  {[kota.admin1, kota.country].filter(Boolean).join(", ")}
                </Text>

                <Text style={{ color: warna.teksSekunder }}>
                  Ketuk kota untuk melihat cuaca kembali.
                </Text>
              </TouchableOpacity>

              <Button
                title="Hapus Cache"
                color="#D97706"
                onPress={() =>
                  konfirmasiHapusCache(kota.latitude, kota.longitude, kota.name)
                }
              />

              <Button
                title="Hapus dari Riwayat"
                color="#D32F2F"
                onPress={() => konfirmasiHapusRiwayat(kota)}
              />
            </View>
          ))
        )}

        <View
          style={{
            height: 1,
            backgroundColor: warna.garis,
            marginVertical: 12,
          }}
        />

        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: warna.teks,
          }}
        >
          Kota Favorit
        </Text>

        <Text style={{ color: warna.teksSekunder }}>
          Tersimpan {daftarFavorit.length} kota favorit.
        </Text>

        {sedangMemuat ? null : daftarFavorit.length === 0 ? (
          <Text style={{ color: warna.teks }}>
            Belum ada kota favorit yang tersimpan.
          </Text>
        ) : (
          daftarFavorit.map((kota) => (
            <View
              key={kota.id}
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: warna.garis,
                borderRadius: 8,
                backgroundColor: warna.kartu,
                gap: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: warna.teks,
                }}
              >
                {kota.nama}
              </Text>

              <Text style={{ color: warna.teksSekunder }}>
                Cache cuaca dapat dihapus tanpa menghapus favorit.
              </Text>

              <Button
                title="Hapus Cache"
                color="#D97706"
                onPress={() =>
                  konfirmasiHapusCache(kota.latitude, kota.longitude, kota.nama)
                }
              />

              <Button
                title="Hapus Favorit"
                color="#D32F2F"
                onPress={() => konfirmasiHapusFavorit(kota)}
              />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
