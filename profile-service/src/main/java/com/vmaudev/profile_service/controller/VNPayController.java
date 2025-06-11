package com.vmaudev.profile_service.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.vmaudev.profile_service.model.DepositHistory;
import com.vmaudev.profile_service.model.Profile;
import com.vmaudev.profile_service.service.DepositHistoryService;
import com.vmaudev.profile_service.service.ProfileService;
import com.vmaudev.profile_service.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.logging.Logger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.core.Authentication;

@Controller
@RequestMapping("/api/profiles")
public class VNPayController {

    private static final Logger logger = Logger.getLogger(VNPayController.class.getName());

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private DepositHistoryService depositHistoryService;

    @PostMapping("/submitOrder")
    public ResponseEntity<String> submitOrder(@RequestParam("amount") int orderTotal, @RequestParam("profileId") String profileId, HttpServletRequest request) {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        String vnpayUrl = vnPayService.createOrder(orderTotal, profileId, baseUrl);
        return new ResponseEntity<>(vnpayUrl, HttpStatus.OK);
    }

    @GetMapping("/vnpay-payment")
    public String vnpayReturn(HttpServletRequest request, Model model) {
        int paymentStatus = vnPayService.orderReturn(request);

        String orderInfo = request.getParameter("vnp_OrderInfo");
        String paymentTime = request.getParameter("vnp_PayDate");
        String transactionId = request.getParameter("vnp_TransactionNo");
        String totalPrice = request.getParameter("vnp_Amount");

        logger.info("Payment Status: " + paymentStatus);
        logger.info("profileId: " + orderInfo);
        logger.info("Total Price: " + totalPrice);

        model.addAttribute("orderId", orderInfo);
        model.addAttribute("totalPrice", totalPrice);
        model.addAttribute("paymentTime", paymentTime);
        model.addAttribute("transactionId", transactionId);

        if (paymentStatus == 1) {
            Profile profile = profileService.getUserById(orderInfo);
            if (profile != null) {
                // VNPay trả về số tiền đã nhân 100, nên chia cho 1000 để lấy số tiền VND
                BigDecimal totalAmount = new BigDecimal(totalPrice).divide(new BigDecimal(1000));
                // Chuyển đổi VND sang coin (1 coin = 100 VND)
                BigDecimal coins = totalAmount.divide(new BigDecimal(100));
                BigDecimal currentCoin = profile.getCoin() != null ? profile.getCoin() : BigDecimal.ZERO;
                profile.setCoin(currentCoin.add(coins));
                profileService.updateProfile(profile);

                // Lưu lịch sử nạp tiền
                DepositHistory depositHistory = new DepositHistory();
                depositHistory.setProfileId(orderInfo);
                // Lưu số tiền VND chính xác (nhân lại cho 1000 vì đã chia ở trên)
                depositHistory.setAmountVnd(totalAmount.multiply(new BigDecimal(1000)));
                depositHistory.setAmountCoin(coins);
                depositHistory.setTransactionId(transactionId);
                depositHistory.setPaymentTime(LocalDateTime.now());
                depositHistory.setStatus("SUCCESS");
                depositHistory.setPaymentMethod("VNPAY");
                depositHistory.setDescription("Nạp tiền qua VNPay");
                depositHistoryService.saveDepositHistory(depositHistory);

                logger.info("Deposit history saved for profile: " + orderInfo);
            } else {
                logger.warning("Profile not found for profileId: " + orderInfo);
            }
        }

        return "redirect:http://localhost:3000";
    }

    @GetMapping("/deposit-history/{profileId}")
    public ResponseEntity<List<DepositHistory>> getDepositHistory(@PathVariable String profileId) {
        List<DepositHistory> history = depositHistoryService.getDepositHistoryByProfileId(profileId);
        return new ResponseEntity<>(history, HttpStatus.OK);
    }

    @GetMapping("/deposit-history")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<List<DepositHistory>> getAllDepositHistory(
            @RequestParam(required = false) Integer days) {
        List<DepositHistory> history = depositHistoryService.getAllDepositHistory(days);
        return new ResponseEntity<>(history, HttpStatus.OK);
    }

    @GetMapping("/total-deposits")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> getTotalDeposits(
            @RequestParam(required = false) Integer days) {
        Map<String, Object> totals = depositHistoryService.getTotalDeposits(days);
        return new ResponseEntity<>(totals, HttpStatus.OK);
    }

    @GetMapping("/deposit-statistics")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> getDepositStatistics() {
        Map<String, Object> statistics = depositHistoryService.getDepositStatistics();
        return new ResponseEntity<>(statistics, HttpStatus.OK);
    }
}