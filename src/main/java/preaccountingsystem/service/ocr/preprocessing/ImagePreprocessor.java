package preaccountingsystem.service.ocr.preprocessing;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;
import java.awt.image.ConvolveOp;
import java.awt.image.Kernel;
import java.awt.image.RescaleOp;

/**
 * Service for preprocessing images before OCR
 * Implements advanced image processing techniques to improve OCR accuracy
 */
@Slf4j
@Service
public class ImagePreprocessor {

    /**
     * Preprocess an image through multiple enhancement steps
     *
     * @param original Original image
     * @return Preprocessed image optimized for OCR
     */
    public BufferedImage preprocess(BufferedImage original) {
        log.debug("Starting image preprocessing. Original size: {}x{}",
            original.getWidth(), original.getHeight());

        BufferedImage processed = original;

        // 1. Convert to grayscale
        processed = convertToGrayscale(processed);
        log.debug("Step 1: Grayscale conversion complete");

        // 2. Apply noise reduction (Gaussian blur)
        processed = applyGaussianBlur(processed);
        log.debug("Step 2: Noise reduction complete");

        // 3. Detect and correct skew (rotation)
        double angle = detectSkewAngle(processed);
        if (Math.abs(angle) > 0.5) {
            processed = rotateImage(processed, angle);
            log.debug("Step 3: Deskew complete. Angle: {}", angle);
        } else {
            log.debug("Step 3: No significant skew detected");
        }

        // 4. Enhance contrast
        processed = enhanceContrast(processed);
        log.debug("Step 4: Contrast enhancement complete");

        // 5. Binarization (convert to black and white using adaptive threshold)
        processed = adaptiveThreshold(processed);
        log.debug("Step 5: Binarization complete");

        log.info("Image preprocessing complete. Final size: {}x{}",
            processed.getWidth(), processed.getHeight());

        return processed;
    }

    /**
     * Convert image to grayscale
     */
    private BufferedImage convertToGrayscale(BufferedImage img) {
        BufferedImage gray = new BufferedImage(
            img.getWidth(),
            img.getHeight(),
            BufferedImage.TYPE_BYTE_GRAY
        );

        Graphics2D g = gray.createGraphics();
        g.drawImage(img, 0, 0, null);
        g.dispose();

        return gray;
    }

    /**
     * Apply Gaussian blur to reduce noise
     */
    private BufferedImage applyGaussianBlur(BufferedImage img) {
        float[] matrix = {
            1/16f, 2/16f, 1/16f,
            2/16f, 4/16f, 2/16f,
            1/16f, 2/16f, 1/16f
        };

        Kernel kernel = new Kernel(3, 3, matrix);
        ConvolveOp op = new ConvolveOp(kernel, ConvolveOp.EDGE_NO_OP, null);

        return op.filter(img, null);
    }

    /**
     * Detect skew angle using simple heuristic
     * For production, consider using OpenCV's Hough transform
     */
    private double detectSkewAngle(BufferedImage img) {
        // Simplified skew detection
        // In production, use Hough transform or similar algorithm
        // For now, return 0 (no skew detected)
        // This can be enhanced later with OpenCV integration
        return 0.0;
    }

    /**
     * Rotate image by given angle
     */
    private BufferedImage rotateImage(BufferedImage img, double angle) {
        double radians = Math.toRadians(angle);
        double sin = Math.abs(Math.sin(radians));
        double cos = Math.abs(Math.cos(radians));

        int newWidth = (int) Math.floor(img.getWidth() * cos + img.getHeight() * sin);
        int newHeight = (int) Math.floor(img.getHeight() * cos + img.getWidth() * sin);

        BufferedImage rotated = new BufferedImage(newWidth, newHeight, img.getType());
        Graphics2D g = rotated.createGraphics();

        AffineTransform at = new AffineTransform();
        at.translate(newWidth / 2.0, newHeight / 2.0);
        at.rotate(radians);
        at.translate(-img.getWidth() / 2.0, -img.getHeight() / 2.0);

        g.setTransform(at);
        g.drawImage(img, 0, 0, null);
        g.dispose();

        return rotated;
    }

    /**
     * Enhance image contrast
     */
    private BufferedImage enhanceContrast(BufferedImage img) {
        // Increase brightness slightly and scale contrast
        RescaleOp op = new RescaleOp(1.2f, 10, null);
        return op.filter(img, null);
    }

    /**
     * Apply adaptive threshold using Otsu's method
     */
    private BufferedImage adaptiveThreshold(BufferedImage img) {
        int threshold = calculateOtsuThreshold(img);

        BufferedImage binary = new BufferedImage(
            img.getWidth(),
            img.getHeight(),
            BufferedImage.TYPE_BYTE_BINARY
        );

        for (int y = 0; y < img.getHeight(); y++) {
            for (int x = 0; x < img.getWidth(); x++) {
                int rgb = img.getRGB(x, y);
                int gray = (rgb >> 16) & 0xFF;
                binary.setRGB(x, y, gray < threshold ? 0xFF000000 : 0xFFFFFFFF);
            }
        }

        return binary;
    }

    /**
     * Calculate optimal threshold using Otsu's method
     */
    private int calculateOtsuThreshold(BufferedImage img) {
        int[] histogram = new int[256];
        int total = img.getWidth() * img.getHeight();

        // Build histogram
        for (int y = 0; y < img.getHeight(); y++) {
            for (int x = 0; x < img.getWidth(); x++) {
                int gray = (img.getRGB(x, y) >> 16) & 0xFF;
                histogram[gray]++;
            }
        }

        // Calculate sum
        double sum = 0;
        for (int i = 0; i < 256; i++) {
            sum += i * histogram[i];
        }

        double sumB = 0;
        int wB = 0;
        int wF = 0;
        double maxVar = 0;
        int threshold = 0;

        // Otsu's algorithm
        for (int i = 0; i < 256; i++) {
            wB += histogram[i];
            if (wB == 0) continue;

            wF = total - wB;
            if (wF == 0) break;

            sumB += i * histogram[i];
            double mB = sumB / wB;
            double mF = (sum - sumB) / wF;
            double varBetween = wB * wF * (mB - mF) * (mB - mF);

            if (varBetween > maxVar) {
                maxVar = varBetween;
                threshold = i;
            }
        }

        return threshold;
    }
}
