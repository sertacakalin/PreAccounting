package preaccountingsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AIReportRequest {

    @NotBlank(message = "Rapor türü boş olamaz")
    private String raporTuru;

    @NotNull(message = "Başlangıç tarihi boş olamaz")
    private LocalDate baslangicTarihi;

    @NotNull(message = "Bitiş tarihi boş olamaz")
    private LocalDate bitisTarihi;

    private String firmaUnvan;
    private String vergiNo;
    private String ozelSorgu; // "ozel_sorgu" rapor türü için
}
