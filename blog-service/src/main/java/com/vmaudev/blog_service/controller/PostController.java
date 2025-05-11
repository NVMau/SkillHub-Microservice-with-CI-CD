package com.vmaudev.blog_service.controller;

import com.vmaudev.blog_service.dto.PostResponse;
import com.vmaudev.blog_service.dto.PostStatsResponse;
import com.vmaudev.blog_service.model.Comment;
import com.vmaudev.blog_service.model.Interaction;
import com.vmaudev.blog_service.model.Post;
import com.vmaudev.blog_service.service.CommentService;
import com.vmaudev.blog_service.service.InteractionService;
import com.vmaudev.blog_service.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/blog")
public class PostController {
    @Autowired
    private PostService postService;
    @Autowired
    private InteractionService interactionService;
    @Autowired
    private CommentService commentService;


    @PostMapping(value = "/posts", consumes = {"multipart/form-data"})
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<PostResponse> createPost(
            @RequestParam("authorId") String authorId,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {

        Post post = new Post();
        post.setAuthorId(authorId);
        post.setTitle(title);
        post.setContent(content);

        // Gọi PostService để xử lý việc tạo bài viết và upload hình ảnh
        Post createdPost = postService.createPost(post, image);

        PostResponse response = new PostResponse();
        response.setPostId(createdPost.getPostId());
        response.setAuthorId(createdPost.getAuthorId());
        response.setTitle(createdPost.getTitle());
        response.setContent(createdPost.getContent());
        response.setImageUrl(createdPost.getImageUrl());
        response.setCreatedAt(createdPost.getCreatedAt());
        response.setUpdatedAt(createdPost.getUpdatedAt());

        return ResponseEntity.ok(response);
    }

    // Lấy tất cả bài viết
    @GetMapping("/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    // Lấy bài viết theo ID
    @GetMapping("/posts/{postId}")
    public ResponseEntity<Post> getPostById(@PathVariable String postId) {
        Optional<Post> post = postService.getPostById(postId);
        return post.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cập nhật bài viết
    @PutMapping("/posts/{postId}")
    public ResponseEntity<Post> updatePost(@PathVariable String postId, @RequestBody Post post) {
        Post updatedPost = postService.updatePost(postId, post);
        if (updatedPost != null) {
            return ResponseEntity.ok(updatedPost);
        }
        return ResponseEntity.notFound().build();
    }

    // Xóa bài viết
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable String postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/interactions")
    public ResponseEntity<Interaction> addInteraction(@RequestBody Interaction interaction) {
        Interaction createdInteraction = interactionService.addInteraction(interaction);
        return ResponseEntity.ok(createdInteraction);
    }

    // Lấy tất cả tương tác theo PostId
    @GetMapping("/interactions/{postId}")
    public ResponseEntity<List<Interaction>> getInteractionsByPostId(@PathVariable String postId) {
        return ResponseEntity.ok(interactionService.getInteractionsByPostId(postId));
    }

    @PostMapping("/comments")
    public ResponseEntity<Comment> addComment(@RequestBody Comment comment) {
        Comment createdComment = commentService.addComment(comment);
        return ResponseEntity.ok(createdComment);
    }

    // Lấy tất cả bình luận theo PostId
    @GetMapping("/comments/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPostId(@PathVariable String postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    // Get post statistics (like and comment counts)
    @GetMapping("/posts/{postId}/stats")
    public ResponseEntity<PostStatsResponse> getPostStats(@PathVariable String postId) {
        PostStatsResponse stats = postService.getPostStats(postId);
        return ResponseEntity.ok(stats);
    }
}
