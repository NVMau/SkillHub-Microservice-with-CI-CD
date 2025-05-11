package com.vmaudev.assignment_service.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class PdfTextExtractor {
    private static final Logger logger = LoggerFactory.getLogger(PdfTextExtractor.class);
    
    public static String extractTextFromPdfUrl(String pdfUrl) throws IOException {
        try {
            // Sử dụng URI để encode URL đúng cách
            URL url = new URI(pdfUrl).toURL();
            
            // Thiết lập connection với timeout
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(30000);
            
            // Kiểm tra response code
            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                throw new IOException("Server returned HTTP response code: " + responseCode + " for URL: " + pdfUrl);
            }
            
            // Đọc file PDF
            try (InputStream in = connection.getInputStream();
                 PDDocument document = PDDocument.load(in)) {
                PDFTextStripper pdfStripper = new PDFTextStripper();
                return pdfStripper.getText(document);
            }
        } catch (Exception e) {
            logger.error("Lỗi khi đọc file PDF từ URL: {}", pdfUrl, e);
            // Cho phép fallback để tránh lỗi nghiêm trọng
            return "Không thể đọc nội dung PDF. Chi tiết lỗi: " + e.getMessage();
        }
    }
} 