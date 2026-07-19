package com.aiplacement.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class ResumeParserUtil {

    public static String parse(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty or missing.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        }

        String lowercaseName = filename.toLowerCase();
        try (InputStream is = file.getInputStream()) {
            if (lowercaseName.endsWith(".pdf")) {
                try (PDDocument document = PDDocument.load(is)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(document);
                }
            } else if (lowercaseName.endsWith(".docx")) {
                try (XWPFDocument doc = new XWPFDocument(is);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    return extractor.getText();
                }
            } else if (lowercaseName.endsWith(".txt")) {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            } else {
                // If it is another format, try to parse it as UTF-8 plain text as a fallback
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            }
        }
    }
}
