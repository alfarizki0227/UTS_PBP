import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Button, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTema } from "../../context/ThemeContext";
import {
  ambilSemuaFavorit,
  hapusFavorit,
} from "../../services/favoritStorages";
import { hapusCacheKota } from "../../services/offlineCache";

import type { KotaFavorit } from "../../../types/favorit";

export default function HalamanRiwayat() {
  const { warna } = useTema();

  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(true);

  // Memuat ulang daftar favorit saat halaman dibuka.
  useFocusEffect(
    useCallback(() => {
      let masihAktif = true;

      async function muatFavorit() {
        try {
          setSedangMemuat(true);

          const data = await ambilSemuaFavorit();

          if (masihAktif) {
            setDaftarFavorit(data);
          }
        } catch (error) {
          console.error("Gagal memuat kota favorit:", error);

          if (masihAktif) {
            Alert.alert("Gagal", "Daftar kota favorit tidak dapat dimuat.");
          }
        } finally {
          if (masihAktif) {
            setSedangMemuat(false);
          }
        }
      }

      void muatFavorit();

      return () => {
        masihAktif = false;
      };
    }, []),
  );

  // Konfirmasi dan hapus cache kota.
  function konfirmasiHapusCache(kota: KotaFavorit) {
    Alert.alert(
      "Hapus Cache Kota",
      `Apakah kamu yakin ingin menghapus cache cuaca dan pencarian kota ${kota.nama}?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus Cache",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await hapusCacheKota(kota.latitude, kota.longitude);

                Alert.alert(
                  "Berhasil",
                  `Cache kota ${kota.nama} berhasil dihapus.`,
                );
              } catch (error) {
                console.error("Gagal menghapus cache:", error);

                Alert.alert(
                  "Gagal",
                  `Cache kota ${kota.nama} tidak berhasil dihapus.`,
                );
              }
            })();
          },
        },
      ],
    );
  }

  // Konfirmasi dan hapus kota dari daftar favorit.
  function konfirmasiHapusFavorit(kota: KotaFavorit) {
    Alert.alert(
      "Hapus Kota Favorit",
      `Hapus ${kota.nama} dari daftar favorit? Cache cuacanya tidak ikut dihapus.`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
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

                Alert.alert(
                  "Berhasil",
                  `${kota.nama} berhasil dihapus dari favorit.`,
                );
              } catch (error) {
                console.error("Gagal menghapus kota favorit:", error);

                Alert.alert("Gagal", "Kota favorit tidak berhasil dihapus.");
              }
            })();
          },
        },
      ],
    );
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
          Riwayat dan Kota Favorit
        </Text>

        <Text style={{ color: warna.teksSekunder }}>
          Tersimpan {daftarFavorit.length} kota
        </Text>

        {sedangMemuat ? (
          <Text style={{ color: warna.teks }}>Memuat daftar kota...</Text>
        ) : daftarFavorit.length === 0 ? (
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
                Cache offline dapat dihapus tanpa menghapus kota dari daftar
                favorit.
              </Text>

              <Button
                title="Hapus Cache"
                color="#D97706"
                onPress={() => konfirmasiHapusCache(kota)}
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
